import { Order } from '@/types';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'orders@haridealers.com',
  adminEmail: process.env.ADMIN_EMAIL || 'haridealers@gmail.com',
  apiKey: process.env.RESEND_API_KEY || '',
};

function getEmailWrapper(content: string, preheader: string = 'Hari Dealers Luxury Ethnic Fashion'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hari Dealers</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f2ea; margin: 0; padding: 20px; color: #141213; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #ebd37e; box-shadow: 0 4px 20px rgba(59,12,34,0.08); }
    .header { background: linear-gradient(135deg, #3b0c22 0%, #220613 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #d4af37; }
    .header h1 { margin: 0; color: #d4af37; font-size: 26px; letter-spacing: 2px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; color: #faf4d7; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; }
    .body { padding: 30px; }
    .order-box { background: #fdfbf7; border: 1px solid #e1bc53; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #3b0c22; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; margin-top: 15px; border: 1px solid #d4af37; }
    .footer { background-color: #220613; color: #a09298; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #d4af37; text-decoration: none; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; font-size: 13px; color: #5c1634; }
    .table td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>HARI DEALERS</h1>
      <p>Luxury Ethnic Fashion & Dresses</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Hari Dealers. All rights reserved.</p>
      <p>Quality Products &bull; Affordable Prices &bull; Fast Delivery &bull; Easy Returns</p>
      <p><a href="mailto:haridealers@gmail.com">haridealers@gmail.com</a> | +91 7339635485</p>
    </div>
  </div>
</body>
</html>
  `;
}

export const emailService = {
  // 1. Order confirmation
  orderConfirmation(order: Order): EmailPayload {
    const itemsHtml = order.items
      .map(
        (i) => `<tr>
          <td><strong>${i.product_name}</strong><br><span style="font-size:12px;color:#666">Size: ${i.size} | Color: ${i.color} &times; ${i.quantity}</span></td>
          <td style="text-align:right;">₹${i.total_price.toLocaleString('en-IN')}</td>
        </tr>`
      )
      .join('');

    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">Your Order #${order.order_number} is Confirmed!</h2>
      <p>Dear <strong>${order.customer_name}</strong>,</p>
      <p>Thank you for shopping with Hari Dealers. We have received your order and our team is preparing it with care.</p>
      <div class="order-box">
        <p style="margin:0 0 10px 0;"><strong>Order Number:</strong> #${order.order_number}</p>
        <p style="margin:0 0 10px 0;"><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
        <p style="margin:0 0 10px 0;"><strong>Payment Status:</strong> ${order.payment_status.toUpperCase()}</p>
        <table class="table">
          <thead>
            <tr><th>Item</th><th style="text-align:right;">Amount</th></tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td style="text-align:right; padding-top:15px;"><strong>Subtotal:</strong></td>
              <td style="text-align:right; padding-top:15px;">₹${order.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${order.coupon_discount > 0 ? `<tr>
              <td style="text-align:right; color:#16a34a;">Coupon Discount:</td>
              <td style="text-align:right; color:#16a34a;">-₹${order.coupon_discount.toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr>
              <td style="text-align:right;">Delivery Charge:</td>
              <td style="text-align:right;">${order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</td>
            </tr>
            <tr>
              <td style="text-align:right;"><strong>Total Amount:</strong></td>
              <td style="text-align:right; font-size:18px; color:#3b0c22;"><strong>₹${order.total_amount.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><strong>Shipping To:</strong><br>
      ${order.shipping_address.full_name}, ${order.shipping_address.address_line1}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}<br>
      Phone: ${order.shipping_address.phone}</p>
      <center><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/account/orders/${order.order_number}" class="btn">View & Track Order</a></center>
    `, `Your Hari Dealers order #${order.order_number} has been confirmed.`);

    return {
      to: order.customer_email,
      subject: `Your Hari Dealers order #${order.order_number} has been confirmed`,
      html,
    };
  },

  // 2. Payment confirmation
  paymentConfirmation(order: Order, paymentId: string): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#16a34a; margin-top:0;">Payment Received Successfully</h2>
      <p>Dear <strong>${order.customer_name}</strong>,</p>
      <p>We have successfully verified your online payment of <strong>₹${order.total_amount.toLocaleString('en-IN')}</strong> for order <strong>#${order.order_number}</strong>.</p>
      <div class="order-box">
        <p><strong>Payment Transaction ID:</strong> ${paymentId}</p>
        <p><strong>Payment Gateway:</strong> Razorpay Secure</p>
        <p><strong>Amount Paid:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
      </div>
      <p>Your order is now moving into our fulfilment pipeline.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Payment Confirmed - Order #${order.order_number} - Hari Dealers`,
      html,
    };
  },

  // 3. Order processing
  orderProcessing(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">Order #${order.order_number} is Processing</h2>
      <p>Dear ${order.customer_name}, our tailoring and quality checking team is currently inspecting your styles before packaging.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Order #${order.order_number} is being processed - Hari Dealers`,
      html,
    };
  },

  // 4. Order packed
  orderPacked(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">Order #${order.order_number} is Packed!</h2>
      <p>Dear ${order.customer_name}, your items have been securely packed in premium Hari Dealers packaging and are ready for courier handover.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Order #${order.order_number} is packed and ready - Hari Dealers`,
      html,
    };
  },

  // 5. Order shipped
  orderShipped(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">Your Order #${order.order_number} Has Been Shipped!</h2>
      <p>Dear ${order.customer_name}, your parcel is on its way to you.</p>
      <div class="order-box">
        <p><strong>Courier Partner:</strong> ${order.courier_name || 'Express Courier'}</p>
        <p><strong>Tracking Number:</strong> ${order.tracking_number || 'Will update shortly'}</p>
        ${order.tracking_url ? `<p><a href="${order.tracking_url}" target="_blank" style="color:#d4af37; font-weight:bold;">Track on Courier Website &rarr;</a></p>` : ''}
      </div>
      <center><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/account/orders/${order.order_number}" class="btn">Live Order Tracking</a></center>
    `);
    return {
      to: order.customer_email,
      subject: `Your Hari Dealers order #${order.order_number} has been shipped!`,
      html,
    };
  },

  // 6. Out for delivery
  outForDelivery(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#eab308; margin-top:0;">Out for Delivery Today!</h2>
      <p>Dear ${order.customer_name}, your Hari Dealers parcel #${order.order_number} will be delivered today. Please ensure someone is available at the address.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Out for Delivery Today - Order #${order.order_number}`,
      html,
    };
  },

  // 7. Delivered
  orderDelivered(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#16a34a; margin-top:0;">Order #${order.order_number} Delivered!</h2>
      <p>Dear ${order.customer_name}, your order has been successfully delivered. We hope you love your new outfit!</p>
      <p>We'd love to hear your feedback:</p>
      <center><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/account/orders/${order.order_number}" class="btn">Leave a Review</a></center>
    `);
    return {
      to: order.customer_email,
      subject: `Delivered: Your Hari Dealers order #${order.order_number}`,
      html,
    };
  },

  // 8. Order cancelled
  orderCancelled(order: Order, reason?: string): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#dc2626; margin-top:0;">Order #${order.order_number} Cancelled</h2>
      <p>Dear ${order.customer_name},</p>
      <p>Your order #${order.order_number} has been cancelled as requested.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      ${order.payment_method === 'online' && order.payment_status === 'paid' ? 
        `<p style="color:#d97706;"><strong>Refund Notice:</strong> A full refund of ₹${order.total_amount.toLocaleString('en-IN')} has been initiated and will credit to your original payment method in 5-7 business days.</p>` 
        : ''}
    `);
    return {
      to: order.customer_email,
      subject: `Order #${order.order_number} Cancelled - Hari Dealers`,
      html,
    };
  },

  // 9. Refund initiated
  refundInitiated(order: Order, amount: number): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#16a34a; margin-top:0;">Refund Initiated</h2>
      <p>Dear ${order.customer_name}, a refund of <strong>₹${amount.toLocaleString('en-IN')}</strong> for order #${order.order_number} has been processed via our payment gateway.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Refund Processed for Order #${order.order_number} - Hari Dealers`,
      html,
    };
  },

  // 10. Return request
  returnRequested(order: Order, reason: string): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">Return Request Received</h2>
      <p>Dear ${order.customer_name}, we have received your return request for order #${order.order_number}.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Our support team will review this within 24 hours to schedule reverse pickup.</p>
    `);
    return {
      to: order.customer_email,
      subject: `Return Request Received - Order #${order.order_number}`,
      html,
    };
  },

  // 11. Admin new order alert
  adminNewOrder(order: Order): EmailPayload {
    const html = getEmailWrapper(`
      <h2 style="color:#3b0c22; margin-top:0;">🔔 New Order Received - #${order.order_number}</h2>
      <div class="order-box">
        <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_phone})</p>
        <p><strong>Total Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()} (${order.payment_status.toUpperCase()})</p>
        <p><strong>City:</strong> ${order.shipping_address.city}, ${order.shipping_address.state}</p>
      </div>
      <center><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/orders" class="btn">Process in Admin Dashboard</a></center>
    `, `New Order Received - #${order.order_number}`);

    return {
      to: EMAIL_CONFIG.adminEmail,
      subject: `New Order Received - #${order.order_number} (₹${order.total_amount})`,
      html,
    };
  },

  // Server-side dispatcher
  async send(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!EMAIL_CONFIG.apiKey) {
      console.log(`[EMAIL DISPATCHER (SIMULATED - NO API KEY)] To: ${payload.to} | Subject: ${payload.subject}`);
      return { success: true, id: `mock_email_${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EMAIL_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          from: EMAIL_CONFIG.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to dispatch email' };
    }
  },
};
