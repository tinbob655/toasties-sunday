import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { createPaymentIntent } from './paymentAPI';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    cost: number,
    username: string,
};

export default function CardPaymentForm({ cost, username }: params): React.ReactElement {

    const stripe = useStripe();
    const elements = useElements();
    const auth = useAuth();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        // Validate the card input
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || 'Validation failed.');
            setIsProcessing(false);
            return;
        }

        // Create PaymentIntent on the server (deferred intent pattern)
        // For orders, cost is looked up server-side; for donations, send cost
        let clientSecret: string;
        let paymentIntentId: string;
        try {
            const isDonation = username === 'NO_NAME';
            const res = await createPaymentIntent(
                isDonation ? { cost, isDonation: true } : undefined
            );
            clientSecret = res.clientSecret;
            paymentIntentId = res.paymentIntentId;
        } catch (err: any) {
            setErrorMessage(err.response?.data?.error || 'Failed to create payment.');
            setIsProcessing(false);
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
            setIsProcessing(false);
        } else {
            const successUrl = `/paymentCompleted?payment_intent=${paymentIntentId}&redirect_status=succeeded`;
            // Skip database update for anonymous users
            if (username === 'NO_NAME') {
                window.location.href = successUrl;
            } else {
                payOrder(auth.username, paymentIntentId).then(() => {
                    window.location.href = successUrl;
                }).catch((err: any) => {
                    setErrorMessage(err.response?.data?.error || 'Failed to verify payment.');
                    setIsProcessing(false);
                });
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <PaymentElement options={{
                wallets: { applePay: 'never', googlePay: 'never' },
            }} />
            {errorMessage && <p className="errorText">{errorMessage}</p>}
            <input
                type="submit"
                value={isProcessing ? 'Processing...' : 'Pay with Card'}
                disabled={!stripe || isProcessing}
                style={{marginTop: '20px'}}
            />
        </form>
    );
};
