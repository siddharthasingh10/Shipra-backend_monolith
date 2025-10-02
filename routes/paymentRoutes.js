const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * POST /api/payments/create-order
 * Body: { amount, currency = "INR", receipt (optional), notes? }
 * amount must be in paise (i.e., smallest currency unit): Rs 100 => 10000
 */
router.post('/create-order', paymentController.createOrder);

/**
 * POST /api/payments/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * This is the endpoint the frontend calls after checkout completes to let backend verify.
 */
router.post('/verify-payment', paymentController.verifyPayment);

/**
 * POST /api/payments/webhook
 * Razorpay will POST here. We verify with webhook secret using raw body.
 */
router.post('/webhook', paymentController.webhookHandler);

module.exports = router;
