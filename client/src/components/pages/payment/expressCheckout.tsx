import React, { useState, useCallback } from 'react';
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    clientSecret: string,
    username: string,
};

export default function ExpressCheckout({ clientSecret, username }: params): React.ReactElement {

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
                payOrder(auth.username).then(() => {
                    window.location.href = '/paymentCompleted';
                });
            }
        }
    }, [stripe, elements, clientSecret, username, auth.username]);

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
