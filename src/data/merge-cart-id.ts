// import { cookies } from "next/headers";
// import db from "@/lib/db";
// import { getUserById } from "./user";

// export const mergeCartId = async (userId: string) => {
//   const user = await getUserById(userId);
//   const cookieStore = cookies();

//   const cookieCartId = (await cookieStore).get("myCart")?.value ?? null;

//   const userCart = user?.id
//     ? await db.cart.findFirst({
//         where: { userId: user.id },
//         include: { items: true },
//       })
//     : null;

//   const cookieCart = cookieCartId
//     ? await db.cart.findUnique({
//         where: { id: cookieCartId },
//         include: { items: true },
//       })
//     : null;

//   // If both exist and are different, merge
//   if (user && cookieCart && userCart && cookieCart.id !== userCart.id) {
//     for (const item of cookieCart.items) {
//       const alreadyExists = userCart.items.some(
//         (i) => i.productId === item.productId
//       );

//       if (!alreadyExists) {
//         await db.cartItem.create({
//           data: {
//             cartId: userCart.id,
//             productId: item.productId,
//             quantity: 1,
//           },
//         });
//       }
//     }

//     // First delete items from the cookie cart
//     await db.cartItem.deleteMany({
//       where: { cartId: cookieCart.id },
//     });

//     // Delete the old cookie cart
//     await db.cart.delete({ where: { id: cookieCart.id } });

//     // Replace cookie with user's cart ID
//     (await cookieStore).set("myCart", userCart.id, {
//       path: "/",
//       httpOnly: true,
//     });

//     return;
//   }

//   // If cookie cart exists but no user cart — link cookie cart to user
//   if (user && cookieCart && !userCart) {
//     await db.cart.update({
//       where: { id: cookieCart.id },
//       data: { userId: user.id },
//     });

//     return;
//   }
// };
