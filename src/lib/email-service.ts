// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: parseInt(process.env.EMAIL_PORT || "587"),
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export async function sendVerificationEmail(
//   email: string,
//   token: string,
//   name: string,
// ) {
//   const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>Verify Your Email</title>
//       <style>
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//         }
//         .header {
//           background: linear-gradient(135deg, #f59e0b, #ea580c);
//           padding: 30px;
//           text-align: center;
//           border-radius: 10px 10px 0 0;
//         }
//         .header h1 {
//           color: white;
//           margin: 0;
//           font-size: 28px;
//         }
//         .content {
//           background: #fff;
//           padding: 30px;
//           border: 1px solid #e5e7eb;
//           border-top: none;
//           border-radius: 0 0 10px 10px;
//         }
//         .button {
//           display: inline-block;
//           background: linear-gradient(135deg, #f59e0b, #ea580c);
//           color: white;
//           padding: 12px 30px;
//           text-decoration: none;
//           border-radius: 8px;
//           margin: 20px 0;
//           font-weight: bold;
//         }
//         .footer {
//           text-align: center;
//           padding-top: 20px;
//           font-size: 12px;
//           color: #6b7280;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h1>🍽️ DineEase</h1>
//       </div>
//       <div class="content">
//         <h2>Welcome to DineEase, ${name}!</h2>
//         <p>Thank you for registering with us. Please verify your email address to start enjoying our services.</p>
//         <div style="text-align: center;">
//           <a href="${verificationUrl}" class="button">Verify Email Address</a>
//         </div>
//         <p>Or copy and paste this link in your browser:</p>
//         <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
//           ${verificationUrl}
//         </p>
//         <p>This link will expire in 24 hours.</p>
//         <p>If you didn't create an account with DineEase, please ignore this email.</p>
//       </div>
//       <div class="footer">
//         <p>&copy; 2024 DineEase. All rights reserved.</p>
//         <p>123 Main Street, Kathmandu, Nepal</p>
//       </div>
//     </body>
//     </html>
//   `;

//   await transporter.sendMail({
//     from: `"DineEase" <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject: "Verify Your Email Address - DineEase",
//     html,
//   });
// }

// export async function sendPasswordResetEmail(
//   email: string,
//   token: string,
//   name: string,
// ) {
//   const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>Reset Your Password</title>
//       <style>
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//         }
//         .header {
//           background: linear-gradient(135deg, #f59e0b, #ea580c);
//           padding: 30px;
//           text-align: center;
//           border-radius: 10px 10px 0 0;
//         }
//         .header h1 {
//           color: white;
//           margin: 0;
//           font-size: 28px;
//         }
//         .content {
//           background: #fff;
//           padding: 30px;
//           border: 1px solid #e5e7eb;
//           border-top: none;
//           border-radius: 0 0 10px 10px;
//         }
//         .button {
//           display: inline-block;
//           background: linear-gradient(135deg, #f59e0b, #ea580c);
//           color: white;
//           padding: 12px 30px;
//           text-decoration: none;
//           border-radius: 8px;
//           margin: 20px 0;
//           font-weight: bold;
//         }
//         .footer {
//           text-align: center;
//           padding-top: 20px;
//           font-size: 12px;
//           color: #6b7280;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h1>🍽️ DineEase</h1>
//       </div>
//       <div class="content">
//         <h2>Password Reset Request</h2>
//         <p>Hello ${name},</p>
//         <p>We received a request to reset your password. Click the button below to create a new password.</p>
//         <div style="text-align: center;">
//           <a href="${resetUrl}" class="button">Reset Password</a>
//         </div>
//         <p>Or copy and paste this link in your browser:</p>
//         <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
//           ${resetUrl}
//         </p>
//         <p>This link will expire in 1 hour.</p>
//         <p>If you didn't request a password reset, please ignore this email.</p>
//       </div>
//       <div class="footer">
//         <p>&copy; 2024 DineEase. All rights reserved.</p>
//       </div>
//     </body>
//     </html>
//   `;

//   await transporter.sendMail({
//     from: `"DineEase" <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject: "Reset Your Password - DineEase",
//     html,
//   });
// }

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Email template wrapper
const emailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #fff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      font-size: 12px;
      color: #6b7280;
    }
    .info-box {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      text-align: right;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍽️ DineEase</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>&copy; 2024 DineEase. All rights reserved.</p>
    <p>123 Main Street, Kathmandu, Nepal</p>
    <p>Need help? Contact us at support@dineease.com</p>
  </div>
</body>
</html>
`;

// 1. Verification Email
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string,
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  const content = `
    <h2>Welcome to DineEase, ${name}!</h2>
    <p>Thank you for registering with us. Please verify your email address to start enjoying our services.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
      ${verificationUrl}
    </p>
    <div class="info-box">
      <strong>⚠️ Important:</strong> This link will expire in 24 hours.
    </div>
    <p>If you didn't create an account with DineEase, please ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address - DineEase",
    html: emailTemplate(content, "Email Verification"),
  });
}

// 2. Password Reset Email
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
      ${resetUrl}
    </p>
    <div class="info-box">
      <strong>⚠️ Important:</strong> This link will expire in 1 hour.
    </div>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password - DineEase",
    html: emailTemplate(content, "Password Reset"),
  });
}

// 3. Order Confirmation Email
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number,
  orderType: string,
  estimatedTime?: Date,
) {
  const itemsHtml = items
    .map(
      (item) => `
    <div class="order-item">
      <span>${item.quantity}x ${item.name}</span>
      <span>NPR ${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `,
    )
    .join("");

  const content = `
    <h2>Order Confirmed! 🎉</h2>
    <p>Hello ${name},</p>
    <p>Your order has been successfully placed and confirmed. Here are your order details:</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      <p><strong>Order Type:</strong> ${orderType.replace("_", " ")}</p>
      ${estimatedTime ? `<p><strong>Estimated Ready Time:</strong> ${new Date(estimatedTime).toLocaleTimeString()}</p>` : ""}
    </div>
    
    <h3>Order Items:</h3>
    ${itemsHtml}
    
    <div class="total">
      Total Amount: NPR ${totalAmount.toLocaleString()}
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/user/orders" class="button">Track Your Order</a>
    </div>
    
    <p>Thank you for choosing DineEase! We'll notify you when your order is ready.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Confirmed #${orderNumber} - DineEase`,
    html: emailTemplate(content, "Order Confirmation"),
  });
}

// 4. Order Ready Email
export async function sendOrderReadyEmail(
  email: string,
  name: string,
  orderNumber: string,
  orderType: string,
  pickupLocation?: string,
) {
  const content = `
    <h2>Your Order is Ready! 🍽️</h2>
    <p>Hello ${name},</p>
    <p>Great news! Your order #${orderNumber} is now ready.</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      <p><strong>Order Type:</strong> ${orderType.replace("_", " ")}</p>
      ${orderType === "TAKEAWAY" ? `<p><strong>Pickup Location:</strong> ${pickupLocation || "Main Counter"}</p>` : ""}
      ${orderType === "DINE_IN" ? `<p><strong>Your table is ready for you!</strong></p>` : ""}
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/user/orders" class="button">View Order Details</a>
    </div>
    
    <p>Thank you for dining with us!</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Ready #${orderNumber} - DineEase`,
    html: emailTemplate(content, "Order Ready"),
  });
}

// 5. Order Completed Email
export async function sendOrderCompletedEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  pointsEarned: number,
) {
  const content = `
    <h2>Order Completed! 🎉</h2>
    <p>Hello ${name},</p>
    <p>Thank you for dining with us! Your order #${orderNumber} has been completed.</p>
    
    <div class="info-box">
      <p><strong>Total Amount:</strong> NPR ${totalAmount.toLocaleString()}</p>
      <p><strong>Loyalty Points Earned:</strong> +${pointsEarned} points</p>
      <p><strong>Total Points Balance:</strong> Check your profile</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/orders" class="button">View Order History</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/loyalty" class="button" style="margin-left: 10px;">View Points</a>
    </div>
    
    <p>We hope to serve you again soon!</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Completed #${orderNumber} - DineEase`,
    html: emailTemplate(content, "Order Completed"),
  });
}

// 6. Order Cancelled Email
export async function sendOrderCancelledEmail(
  email: string,
  name: string,
  orderNumber: string,
  cancellationReason?: string,
) {
  const content = `
    <h2>Order Cancelled</h2>
    <p>Hello ${name},</p>
    <p>Your order #${orderNumber} has been cancelled.</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ""}
    </div>
    
    ${
      cancellationReason?.toLowerCase().includes("payment")
        ? `
      <div class="info-box">
        <p><strong>Payment Refund:</strong> If you've already made a payment, the refund will be processed within 3-5 business days.</p>
      </div>
    `
        : ""
    }
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/orders" class="button">View Orders</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button" style="margin-left: 10px;">Order Again</a>
    </div>
    
    <p>We apologize for any inconvenience. If you have any questions, please contact our support team.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Cancelled #${orderNumber} - DineEase`,
    html: emailTemplate(content, "Order Cancelled"),
  });
}

// 7. Reservation Confirmation Email
export async function sendReservationConfirmationEmail(
  email: string,
  name: string,
  reservationDate: Date,
  partySize: number,
  tableNumbers: number[],
  specialRequests?: string,
) {
  const formattedDate = new Date(reservationDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(reservationDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h2>Reservation Confirmed! 🎉</h2>
    <p>Hello ${name},</p>
    <p>Your table has been successfully reserved. We look forward to hosting you!</p>
    
    <div class="info-box">
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Party Size:</strong> ${partySize} ${partySize === 1 ? "person" : "people"}</p>
      <p><strong>Table Number(s):</strong> ${tableNumbers.join(", ")}</p>
    </div>
    
    ${
      specialRequests
        ? `
      <div class="info-box">
        <p><strong>Special Requests:</strong> ${specialRequests}</p>
      </div>
    `
        : ""
    }
    
    <div class="info-box">
      <p><strong>Important Information:</strong></p>
      <p>• Please arrive 5-10 minutes before your reservation time</p>
      <p>• We hold reservations for 15 minutes</p>
      <p>• Free parking is available</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/reservations" class="button">Manage Reservation</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button" style="margin-left: 10px;">View Menu</a>
    </div>
    
    <p>Need to make changes? Please contact us at least 1 hour in advance.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Reservation Confirmed - DineEase`,
    html: emailTemplate(content, "Reservation Confirmed"),
  });
}

// 8. Reservation Cancelled Email
// export async function sendReservationCancelledEmail(
//   email: string,
//   name: string,
//   reservationDate: Date,
//   partySize: number,
// ) {
//   const formattedDate = new Date(reservationDate).toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
//   const formattedTime = new Date(reservationDate).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const content = `
//     <h2>Reservation Cancelled</h2>
//     <p>Hello ${name},</p>
//     <p>Your reservation has been cancelled as requested.</p>

//     <div class="info-box">
//       <p><strong>Date:</strong> ${formattedDate}</p>
//       <p><strong>Time:</strong> ${formattedTime}</p>
//       <p><strong>Party Size:</strong> ${partySize} ${partySize === 1 ? "person" : "people"}</p>
//     </div>

//     <div style="text-align: center;">
//       <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/reservations" class="button">Make New Reservation</a>
//     </div>

//     <p>We hope to welcome you another time! If you cancelled by mistake, please book again.</p>
//   `;

//   await transporter.sendMail({
//     from: `"DineEase" <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject: `Reservation Cancelled - DineEase`,
//     html: emailTemplate(content, "Reservation Cancelled"),
//   });
// }

// lib/email-service.ts (update the sendReservationCancelledEmail function)

export async function sendReservationCancelledEmail(
  email: string,
  name: string,
  reservationDate: Date,
  partySize: number,
  cancelledBy?: string,
) {
  const formattedDate = reservationDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = reservationDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isAdminCancellation = !!cancelledBy;

  const content = `
    <h2>${isAdminCancellation ? "Reservation Cancelled by Restaurant" : "Reservation Cancelled"}</h2>
    <p>Hello ${name},</p>
    <p>${
      isAdminCancellation
        ? `Your reservation has been cancelled by our staff member (${cancelledBy}).`
        : "Your reservation has been cancelled as requested."
    }</p>
    
    <div class="info-box">
      <p><strong>Cancelled Reservation Details:</strong></p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Party Size:</strong> ${partySize} ${partySize === 1 ? "person" : "people"}</p>
      <p><strong>Cancelled On:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    ${
      isAdminCancellation
        ? `
      <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
        <p><strong>Note from Restaurant:</strong></p>
        <p>We apologize for any inconvenience this may have caused. Please contact us if you have any questions.</p>
        <p>Call us: +977 9801234567 | Email: reservations@dineease.com</p>
      </div>
    `
        : ""
    }
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/reservations" class="button">Make New Reservation</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button" style="margin-left: 10px;">Explore Menu</a>
    </div>
    
    <p>We hope to welcome you another time! If you cancelled by mistake, please book again.</p>
    <p>Have questions? Call us at +977 9801234567</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: isAdminCancellation
      ? "Your Reservation Has Been Cancelled - DineEase"
      : "Reservation Cancelled - DineEase",
    html: emailTemplate(content, "Reservation Cancelled"),
  });
}

// 9. Payment Confirmation Email
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  amount: number,
  paymentMethod: string,
  transactionId: string,
) {
  const content = `
    <h2>Payment Confirmed! ✅</h2>
    <p>Hello ${name},</p>
    <p>Your payment has been successfully processed.</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      <p><strong>Amount Paid:</strong> NPR ${amount.toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/orders" class="button">View Order</a>
    </div>
    
    <p>Thank you for your payment! Your order is now being processed.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Payment Confirmed #${orderNumber} - DineEase`,
    html: emailTemplate(content, "Payment Confirmed"),
  });
}

// 10. Loyalty Points Earned Email
export async function sendLoyaltyPointsEmail(
  email: string,
  name: string,
  pointsEarned: number,
  totalPoints: number,
  orderNumber?: string,
) {
  const content = `
    <h2>Loyalty Points Earned! ⭐</h2>
    <p>Hello ${name},</p>
    <p>Great news! You've earned loyalty points from your recent order.</p>
    
    <div class="info-box">
      ${orderNumber ? `<p><strong>Order Number:</strong> #${orderNumber}</p>` : ""}
      <p><strong>Points Earned:</strong> +${pointsEarned} points</p>
      <p><strong>Total Points Balance:</strong> ${totalPoints} points</p>
    </div>
    
    <div class="info-box">
      <p><strong>What can you do with points?</strong></p>
      <p>• Redeem 100 points = NPR 10 off</p>
      <p>• Unlock exclusive rewards</p>
      <p>• Get birthday bonuses</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/loyalty" class="button">View Rewards</a>
    </div>
    
    <p>Keep ordering to earn more points and unlock amazing rewards!</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `You Earned ${pointsEarned} Loyalty Points! - DineEase`,
    html: emailTemplate(content, "Loyalty Points Earned"),
  });
}

// 11. Welcome Email
export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <h2>Welcome to DineEase Family! 🎉</h2>
    <p>Hello ${name},</p>
    <p>Thank you for joining DineEase! We're excited to have you with us.</p>
    
    <div class="info-box">
      <p><strong>Here's what you can do:</strong></p>
      <p>• 🍽️ Browse our delicious menu</p>
      <p>• 📅 Make table reservations</p>
      <p>• 🚚 Order food for delivery</p>
      <p>• ⭐ Earn loyalty points</p>
      <p>• 🎁 Get exclusive offers</p>
    </div>
    
    <div class="info-box">
      <p><strong>Special Welcome Offer:</strong></p>
      <p>Use code <strong>WELCOME10</strong> to get 10% off on your first order!</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Start Ordering</a>
    </div>
    
    <p>Have questions? Our support team is here to help 24/7.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome to DineEase! 🎉",
    html: emailTemplate(content, "Welcome to DineEase"),
  });
}

// 12. Birthday Greeting Email
export async function sendBirthdayGreetingEmail(email: string, name: string) {
  const content = `
    <h2>Happy Birthday! 🎂🎉</h2>
    <p>Dear ${name},</p>
    <p>Wishing you a very Happy Birthday from the entire DineEase team!</p>
    
    <div class="info-box">
      <p><strong>Your Birthday Special Offer:</strong></p>
      <p>🎁 20% off on your entire order</p>
      <p>🍰 Free dessert with any meal</p>
      <p>⭐ Double loyalty points on your birthday</p>
    </div>
    
    <div class="info-box">
      <p><strong>How to Redeem:</strong></p>
      <p>Use code <strong>BDAY20</strong> at checkout or show your ID at the restaurant.</p>
      <p>Valid for 7 days from your birthday.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Claim Your Offer</a>
    </div>
    
    <p>We hope to see you soon to celebrate your special day!</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Happy Birthday from DineEase! 🎂",
    html: emailTemplate(content, "Happy Birthday!"),
  });
}

// 13. Feedback Request Email
export async function sendFeedbackRequestEmail(
  email: string,
  name: string,
  orderNumber: string,
) {
  const content = `
    <h2>We Value Your Feedback! ⭐</h2>
    <p>Hello ${name},</p>
    <p>Thank you for ordering from DineEase. We'd love to hear about your experience!</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/feedback?order=${orderNumber}" class="button">Share Your Feedback</a>
    </div>
    
    <div class="info-box">
      <p>As a thank you, you'll receive <strong>50 bonus loyalty points</strong> for completing the feedback!</p>
    </div>
    
    <p>Your feedback helps us serve you better.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `How was your DineEase experience? - Order #${orderNumber}`,
    html: emailTemplate(content, "Share Your Feedback"),
  });
}

// 14. Password Changed Notification
export async function sendPasswordChangedEmail(email: string, name: string) {
  const content = `
    <h2>Password Changed 🔒</h2>
    <p>Hello ${name},</p>
    <p>Your DineEase account password has been successfully changed.</p>
    
    <div class="info-box">
      <p>If you made this change, no further action is needed.</p>
      <p><strong>If you didn't make this change, please contact our support team immediately.</strong></p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login to Your Account</a>
    </div>
    
    <p>For security reasons, please use a strong password and never share it with anyone.</p>
  `;

  await transporter.sendMail({
    from: `"DineEase" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your Password Has Been Changed - DineEase",
    html: emailTemplate(content, "Password Changed"),
  });
}

// 15. Low Stock Alert Email (Admin)
export async function sendLowStockAlertEmail(
  adminEmail: string,
  items: Array<{ name: string; currentStock: number; minThreshold: number }>,
) {
  const itemsHtml = items
    .map(
      (item) => `
    <div class="order-item">
      <span>${item.name}</span>
      <span style="color: #ef4444;">Stock: ${item.currentStock} (Min: ${item.minThreshold})</span>
    </div>
  `,
    )
    .join("");

  const content = `
    <h2>⚠️ Low Stock Alert</h2>
    <p>The following items are running low on stock and need immediate attention:</p>
    
    ${itemsHtml}
    
    <div class="info-box">
      <p><strong>Action Required:</strong> Please restock these items as soon as possible.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory" class="button">View Inventory</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"DineEase System" <${process.env.EMAIL_FROM}>`,
    to: adminEmail,
    subject: "Low Stock Alert - DineEase Inventory",
    html: emailTemplate(content, "Low Stock Alert"),
  });
}

export const EmailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderReadyEmail,
  sendOrderCompletedEmail,
  sendOrderCancelledEmail,
  sendReservationConfirmationEmail,
  sendReservationCancelledEmail,
  sendPaymentConfirmationEmail,
  sendLoyaltyPointsEmail,
  sendWelcomeEmail,
  sendBirthdayGreetingEmail,
  sendFeedbackRequestEmail,
  sendPasswordChangedEmail,
  sendLowStockAlertEmail,
};
