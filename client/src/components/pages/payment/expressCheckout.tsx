import React, { useState, useCallback } from 'react';
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { createPaymentIntent } from './paymentAPI';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    cost: number,
    username: string,
};

export default function ExpressCheckout({ cost, username }: params): React.ReactElement {

    const stripe = useStripe();
    const elements = useElements();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleConfirm = useCallback(async (_event: StripeExpressCheckoutElementConfirmEvent): Promise<void> => {
        if (!stripe || !elements) return;

        // Validate the Express Checkout Element state
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || 'Validation failed.');
            return;
        }

        // Create PaymentIntent on the server (deferred intent pattern)
        let clientSecret: string;
        let paymentIntentId: string;
        try {
            const res = await createPaymentIntent(cost);
            clientSecret = res.clientSecret;
            paymentIntentId = res.paymentIntentId;
        } catch (err: any) {
            setErrorMessage(err.response?.data?.error || 'Failed to create payment.');
            return;
        }

        // Confirm the payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: window.location.origin + '/paymentCompleted',
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || 'Payment failed.');
        } else {
            // Skip database update for anonymous users
            if (username === 'NO_NAME') {
                window.location.href = '/paymentCompleted';
            } else {
                payOrder(auth.username, paymentIntentId).then(() => {
                    window.location.href = '/paymentCompleted';
                }).catch((err: any) => {
                    setErrorMessage(err.response?.data?.error || 'Failed to verify payment.');
                });
            }
        }
    }, [stripe, elements, cost, username, auth.username]);

    return (
        <div>
            <ExpressCheckoutElement 
                onConfirm={handleConfirm}
                options={{
                    paymentMethods: {
                        googlePay: 'always',
                        applePay: 'always',
                        link: 'auto',
                        klarna: 'never',
                        amazonPay: 'never',
                    },
                }}
            />
            {errorMessage && <p className="errorText">{errorMessage}</p>}
        </div>
    );
};
