const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order'); // optional; if you don't use Mongo, skip saving
const processEnv = process.env;

const razorpay = new Razorpay({
  key_id: processEnv.RAZORPAY_KEY_ID,
  key_secret: processEnv.RAZORPAY_KEY_SECRET
});

/**
 * Create Razorpay order.
 * amount must be integer in smallest currency unit (e.g., paise).
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount || parseInt(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: parseInt(amount), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture. Use 0 for manual capture flow.
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    // Optional: persist in DB
    if (Order) {
      await Order.create({
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status || 'created',
        meta: { notes: notes || {} }
      });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('createOrder err', err);
    return res.status(500).json({ error: 'Could not create order', details: err.message });
  }
};

/**
 * Verify payment (frontend will send the razorpay_order_id, razorpay_payment_id and signature)
 * Signature generation on frontend result to be matched here:
 *  hmac = sha256(order_id + "|" + payment_id, KEY_SECRET)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', processEnv.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Optional: Update DB order status to paid
    if (Order) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { $set: { status: 'paid', razorpayPaymentId: razorpay_payment_id } },
        { new: true }
      );
    }

    // You can also fetch payment details from Razorpay if needed:
    // const payment = await razorpay.payments.fetch(razorpay_payment_id);

    return res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('verifyPayment err', err);
    return res.status(500).json({ error: 'Verification failed', details: err.message });
  }
};


/**
 * Webhook handler. Razorpay sends events here (e.g., payment.captured).
 * IMPORTANT: Signature must be verified using the webhook secret, using rawBody.
 */
exports.webhookHandler = async (req, res) => {
  try {
    const webhookSecret = processEnv.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('No webhook secret configured!');
      return res.status(500).end();
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // set by rawJson in utils

    if (!signature || !rawBody) {
      return res.status(400).json({ error: 'Missing signature or raw body' });
    }

    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      console.warn('Webhook signature mismatch');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Signature valid. parse body and handle events.
    const payload = req.body;
    const event = payload.event || payload?.payload?.payment?.entity?.status;

    // Example: handle payment.captured event
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;

      // update DB order to paid
      if (Order) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { $set: { status: 'paid', razorpayPaymentId: payment.id, capturedAt: new Date() } }
        );
      }

      // Perform post-payment actions (fulfillment, notifications, etc.)
    }

    // Acknowledge quickly
    res.json({ ok: true });
  } catch (err) {
    console.error('webhookHandler err', err);
    res.status(500).end();
  }
};
