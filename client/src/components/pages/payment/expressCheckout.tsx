import React, { useState } from 'react';
import { useStripe, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    clientSecret: string,
    username: string,
};

export default function ExpressCheckout({ clientSecret, username }: params): React.ReactElement {

    const stripe = useStripe();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>('');

    async function handleConfirm(): Promise<void> {
        if (!stripe) return;

        const { error } = await stripe.confirmPayment({
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
    }

    return (
        <div>
            <ExpressCheckoutElement
                onConfirm={handleConfirm}
            />
            {errorMessage && <p className="errorText">{errorMessage}</p>}
        </div>
    );
};
