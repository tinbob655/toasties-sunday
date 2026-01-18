const express = require('express');
const router = express.Router();


//create a payment intent for Apple/Google Pay
router.post('/createPaymentIntent', async (req, res) => {
    try {
    
        //make sure we have a valid price to charge
        const cost = req.body.cost;
        if (!cost) {
            return res.status(400).json({error: "Did not receive a cost to charge"});
        }
        else if (cost <= 0 || cost > 100) {
            return res.status(400).json({error: `Invalid cost: ${cost}`});
        };
    
        //we have a valid cost, create a PaymentIntent
        const stripe = require('stripe')(process.env.STRIPE_SK);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(cost * 100), // Stripe expects amount in pence/cents
            currency: 'gbp',
            automatic_payment_methods: {
                enabled: true,
            },
        });
    
        //return the client secret
        return res.status(200).json({clientSecret: paymentIntent.client_secret});
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    };
});

module.exports = router;