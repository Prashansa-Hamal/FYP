import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session_id")?.value;
    const user = await getUser();

    /* ---------------------------------------------
       MERGE GUEST CART INTO USER CART
    ---------------------------------------------- */
    if (user?.id && sessionId) {
      const [userCart, guestCart] = await Promise.all([
        db.cart.findUnique({
          where: { userId: user.id },
          include: { items: true },
        }),
        db.cart.findUnique({
          where: { sessionId },
          include: { items: true },
        }),
      ]);

      // Only merge if both carts exist and are different
      if (userCart && guestCart && userCart.id !== guestCart.id) {
        for (const guestItem of guestCart.items) {
          const existingItem = userCart.items.find(
            (item) => item.menuItemId === guestItem.menuItemId
          );

          if (existingItem) {
            // Sum quantities
            await db.cartItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: existingItem.quantity + guestItem.quantity,
              },
            });
          } else {
            // Move item to user cart
            await db.cartItem.update({
              where: { id: guestItem.id },
              data: { cartId: userCart.id },
            });
          }
        }

        // Delete guest cart after merge
        await db.cart.delete({
          where: { id: guestCart.id },
        });
      }

      // If user has no cart but guest cart exists → claim it
      if (!userCart && guestCart) {
        await db.cart.update({
          where: { id: guestCart.id },
          data: {
            userId: user.id,
            sessionId: null,
          },
        });
      }
    }

    /* ---------------------------------------------
       CREATE SESSION IF GUEST HAS NONE
    ---------------------------------------------- */
    if (!user?.id && !sessionId) {
      await db.cart.create({
        data: {
          sessionId,
          items: { create: [] },
        },
      });
    }

    /* ---------------------------------------------
       FETCH CART
    ---------------------------------------------- */
    const whereCondition = user?.id
      ? { userId: user.id }
      : { sessionId: sessionId! };

    const cart = await db.cart.findUnique({
      where: whereCondition,
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    const cartData =
      cart ||
      (await db.cart.create({
        data: {
          userId: user?.id,
          sessionId: sessionId!,
          items: { create: [] },
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
            include: { menuItem: true },
          },
        },
      }));

    const response = NextResponse.json({
      success: true,
      data: cartData,
      message: "Cart fetched successfully",
    });

    /* ---------------------------------------------
       SET COOKIE IF GUEST
    ---------------------------------------------- */
    if (!user?.id && sessionId && !cookieStore.get("cart_session_id")) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { menuItemId, quantity = 1 } = await request.json();

    // Validation
    if (!menuItemId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const user = await getUser();
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session_id")?.value;

    /* ---------------------------------------------
       CREATE SESSION IF GUEST HAS NONE
    ---------------------------------------------- */
    if (!user?.id && !sessionId) {
      sessionId = `guest_${crypto.randomUUID()}`;
    }

    /* ---------------------------------------------
       GET OR CREATE CART
    ---------------------------------------------- */
    const cart = await db.cart.upsert({
      where: user?.id ? { userId: user.id } : { sessionId: sessionId! },
      create: {
        userId: user?.id,
        sessionId: user?.id ? undefined : sessionId,
      },
      update: {},
    });

    /* ---------------------------------------------
       ADD / UPDATE CART ITEM
    ---------------------------------------------- */
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
    });

    if (existingItem) {
      // Increment quantity if item already exists
      await db.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      // Create new cart item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
        },
      });
    }

    /* ---------------------------------------------
       RETURN UPDATED CART
    ---------------------------------------------- */
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            menuItem: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      data: updatedCart,
      message: "Item added to cart successfully",
    });

    /* ---------------------------------------------
       SET COOKIE IF NEW SESSION CREATED
    ---------------------------------------------- */
    if (!user?.id && sessionId && !cookieStore.get("cart_session_id")) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error: any) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add menu item to cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { menuItemId, quantity } = await request.json();

    // Validation
    if (!menuItemId || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const user = await getUser();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;

    if (!user?.id && !sessionId) {
      return NextResponse.json(
        { success: false, message: "No cart session found" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
       FIND CART
    ---------------------------------------------- */
    const cart = await db.cart.findUnique({
      where: user?.id ? { userId: user.id } : { sessionId },
    });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------
       FIND CART ITEM
    ---------------------------------------------- */
    const cartItem = await db.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------
       DELETE IF QUANTITY = 0
    ---------------------------------------------- */
    if (quantity === 0) {
      await db.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });
    } else {
      /* ---------------------------------------------
         UPDATE QUANTITY (SET ABSOLUTE VALUE)
      ---------------------------------------------- */
      await db.cartItem.update({
        where: { id: cartItem.id },
        data: {
          quantity, // Set to the new quantity
        },
      });
    }

    /* ---------------------------------------------
       RETURN UPDATED CART
    ---------------------------------------------- */
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCart,
      message: quantity === 0 ? "Item removed from cart" : "Quantity updated",
    });
  } catch (error) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;

    const body = await request.json().catch(() => null);
    const menuItemId = body?.menuItemId;

    if (!user?.id && !sessionId) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No cart found",
      });
    }

    const cart = await db.cart.findUnique({
      where: user?.id ? { userId: user.id } : { sessionId },
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Cart already empty",
      });
    }

    /* ---------------------------------------------
       DELETE SINGLE ITEM
    ---------------------------------------------- */
    if (menuItemId) {
      await db.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          menuItemId,
        },
      });

      const remainingItems = await db.cartItem.count({
        where: { cartId: cart.id },
      });

      // If last item removed → delete cart
      if (remainingItems === 0) {
        await db.cart.delete({ where: { id: cart.id } });

        if (!user?.id) {
          const res = NextResponse.json({
            success: true,
            message: "Cart emptied",
          });
          res.cookies.delete("cart_session_id");
          return res;
        }
      }

      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
      });
    }

    /* ---------------------------------------------
       DELETE ENTIRE CART
    ---------------------------------------------- */
    await db.cart.delete({ where: { id: cart.id } });

    const res = NextResponse.json({
      success: true,
      message: "Cart deleted successfully",
    });

    if (!user?.id) {
      res.cookies.delete("cart_session_id");
    }

    return res;
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete cart" },
      { status: 500 }
    );
  }
}
