const express = require('express');
const router = express.Router();
const { requireAuth, requireOwnerOrAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SK);


//create a payment intent for Apple/Google Pay - requires login
router.post('/createPaymentIntent', requireAuth, async (req, res) => {
    try {
    
        //make sure we have a valid price to charge
        const cost = req.body.cost;
        const username = req.session.user.username;
        
        if (!cost) {
            return res.status(400).json({error: "Did not receive a cost to charge"});
        }
        else if (cost <= 0 || cost > 100) {
            return res.status(400).json({error: `Invalid cost: ${cost}`});
        };
    
        //we have a valid cost, create a PaymentIntent with metadata
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(cost * 100), // Stripe expects amount in pence/cents
            currency: 'gbp',
            automatic_payment_methods: {
                enabled: true,
            },
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

module.exports = router;