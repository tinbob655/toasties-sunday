const express = require('express');
const router = express.Router();
const { requireAuth, requireOwnerOrAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SK);
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// Import or define Purchase model (same as in purchase.js)
class Purchase extends Model {}
Purchase.init(
  {
    username: { type: DataTypes.STRING, primaryKey: true },
    cost: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    toasties: {
      type: DataTypes.TEXT, allowNull: false, defaultValue: '[]',
      get() { const val = this.getDataValue('toasties'); return val ? JSON.parse(val) : []; },
      set(val) { this.setDataValue('toasties', JSON.stringify(val ?? [])); }
    },
    drinks: {
      type: DataTypes.TEXT, allowNull: false, defaultValue: '[]',
      get() { const val = this.getDataValue('drinks'); return val ? JSON.parse(val) : []; },
      set(val) { this.setDataValue('drinks', JSON.stringify(val ?? [])); }
    },
    deserts: {
      type: DataTypes.TEXT, allowNull: false, defaultValue: '[]',
      get() { const val = this.getDataValue('deserts'); return val ? JSON.parse(val): []; },
      set(val) { this.setDataValue('deserts', JSON.stringify(val ?? [])); }
    }
  },
  { sequelize, modelName: 'purchase' }
);


//create a payment intent for Apple/Google Pay - requires login
router.post('/createPaymentIntent', requireAuth, async (req, res) => {
    try {
    
        const username = req.session.user.username;
        const isDonation = req.body.isDonation === true;
        let cost;

        if (isDonation) {
            //for donations, accept cost from request body
            cost = req.body.cost;
        } else {
            //for orders, look up cost from the database (never trust the client)
            const order = await Purchase.findByPk(username);
            if (!order) {
                return res.status(404).json({error: "No order found for this user"});
            }
            if (order.paid) {
                return res.status(400).json({error: "This order has already been paid"});
            }
            cost = parseFloat(order.cost);
        }

        if (!cost || cost <= 0 || cost > 100) {
            return res.status(400).json({error: `Invalid cost: ${cost}`});
        };
    
        //we have a valid cost, create a PaymentIntent with metadata
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(cost * 100), // Stripe expects amount in pence/cents
            currency: 'gbp',
            payment_method_types: ['card', 'link'],
            metadata: {
                username: username, // Associate payment with user
            },
        });
    
        //return the client secret and payment intent ID
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    };
});


//verify payment was successful before marking order as paid
router.post('/verifyPayment', requireAuth, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const username = req.session.user.username;
        
        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }
        
        // Retrieve the payment intent from Stripe to verify it
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Verify the payment was successful
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ 
                error: `Payment not completed. Status: ${paymentIntent.status}` 
            });
        }
        
        // Verify the payment belongs to this user (check metadata)
        if (paymentIntent.metadata.username !== username) {
            return res.status(403).json({ 
                error: 'This payment does not belong to you' 
            });
        }
        
        // Payment verified! Return success - the order should be marked as paid
        // via the purchase route, but only after this verification
        return res.status(200).json({ 
            verified: true,
            amount: paymentIntent.amount / 100, // Convert back from pence
            username: paymentIntent.metadata.username
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// Mark order as paid using payment intent ID (called after redirect)
// This endpoint requires auth and verifies the payment belongs to the logged-in user
router.post('/completePayment', requireAuth, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const sessionUsername = req.session.user.username;
        
        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }
        
        // Retrieve the payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Verify payment succeeded
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ 
                error: `Payment not completed. Status: ${paymentIntent.status}` 
            });
        }
        
        // Get the username from payment metadata
        const orderUsername = paymentIntent.metadata.username;
        
        // Verify the payment belongs to the logged-in user
        if (orderUsername !== sessionUsername) {
            return res.status(403).json({ 
                error: 'This payment does not belong to you' 
            });
        }
        
        // Find the order
        const order = await Purchase.findByPk(orderUsername);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if already paid
        if (order.paid) {
            return res.status(200).json({ 
                message: 'Order already marked as paid',
                order: order
            });
        }
        
        // Verify payment amount matches order cost
        const paidAmount = paymentIntent.amount / 100;
        if (Math.abs(paidAmount - parseFloat(order.cost)) > 0.01) {
            return res.status(400).json({ 
                error: `Payment amount (£${paidAmount}) does not match order cost (£${order.cost})` 
            });
        }
        
        // Mark as paid
        order.paid = true;
        await order.save();
        
        console.log(`Order marked as paid via completePayment: ${orderUsername}`);
        return res.status(200).json({ 
            message: 'Order marked as paid',
            order: order
        });
    }
    catch (err) {
        console.error('Error in completePayment:', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;