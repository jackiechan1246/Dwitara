import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Resend } from 'resend';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint to create an order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    // Validate minimum amount (Razorpay requires min 100 paise i.e. 1 INR)
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise' });
    }

    const options = {
      amount, // amount in the smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Endpoint to verify payment signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // Creating our own digest
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    // Comapring the signatures
    if (generated_signature === razorpay_signature) {
      // payment is successful
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      // payment verification failed
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error validating payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Endpoint to send order notification email
app.post('/api/notify-order', async (req, res) => {
  try {
    const { orderDetails } = req.body;
    if (!orderDetails) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const { customer, items, total, paymentMethod, paymentId, address } = orderDetails;

    const itemRows = items.map(i =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.size || '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">₹${i.price}</td>
      </tr>`
    ).join('');

    const htmlBody = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#1C1B1A">
        <h1 style="border-bottom:2px solid #B28F79;padding-bottom:12px">🛍 New Order Received!</h1>
        <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Payment:</strong> ${paymentMethod.toUpperCase()} ${paymentId ? '— ' + paymentId : ''}</p>
        <h3 style="margin-top:24px">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px 12px;text-align:left">Item</th>
              <th style="padding:8px 12px;text-align:left">Size</th>
              <th style="padding:8px 12px;text-align:left">Qty</th>
              <th style="padding:8px 12px;text-align:left">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <h3 style="margin-top:16px">Total: ₹${total}</h3>
        <h3 style="margin-top:24px">Shipping Address</h3>
        <p>${address.firstName} ${address.lastName}<br/>
        ${address.address}<br/>
        ${address.city}, ${address.pincode}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Dwitara Orders <onboarding@resend.dev>',
      to: [process.env.ORDER_NOTIFY_EMAIL],
      subject: `New Order — ₹${total} from ${customer.name}`,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running securely on port ${PORT}`);
});
