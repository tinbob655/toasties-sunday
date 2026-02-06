import React, { useState, useCallback } from 'react';
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    clientSecret: string,
    username: string,
    paymentIntentId: string,
};

export default function ExpressCheckout({ clientSecret, username, paymentIntentId }: params): React.ReactElement {

    const stripe = useStripe();
    const elements = useElements();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleConfirm = useCallback(async (_event: StripeExpressCheckoutElementConfirmEvent): Promise<void> => {
        if (!stripe || !elements) return;

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
                }).catch((err) => {
                    setErrorMessage(err.response?.data?.error || 'Failed to verify payment.');
                });
            }
        }
    }, [stripe, elements, clientSecret, username, auth.username, paymentIntentId]);

    return (
        <div>
            <ExpressCheckoutElement 
                onConfirm={handleConfirm}
                options={{
                    paymentMethods: {
                        googlePay: 'always',
                        applePay: 'always',
                        link: 'auto',
                        amazonPay: 'never',
                        klarna: 'never',
                        paypal: 'auto',
                    },
                }}
            />
            {errorMessage && <p className="errorText">{errorMessage}</p>}
        </div>
    );
};
