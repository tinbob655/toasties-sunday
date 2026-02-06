import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    clientSecret: string,
    username: string,
    paymentIntentId: string,
};

export default function CardPaymentForm({ clientSecret, username, paymentIntentId }: params): React.ReactElement {

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

        const cardNumberElement = elements.getElement(CardNumberElement);

        if (!cardNumberElement) {
            setErrorMessage('Card element not found.');
            setIsProcessing(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
            },
        });

        if (error) {
            setErrorMessage(error.message || 'Payment failed.');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Skip database update for anonymous users
            if (username === 'NO_NAME') {
                window.location.href = '/paymentCompleted';
            } else {
                payOrder(auth.username, paymentIntentId).then(() => {
                    window.location.href = '/paymentCompleted';
                }).catch((err) => {
                    setErrorMessage(err.response?.data?.error || 'Failed to verify payment.');
                    setIsProcessing(false);
                });
            }
        } else {
            setErrorMessage('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    }

    const elementStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#fff',
                fontFamily: '"Mulish", sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    const inputWrapperStyle = {
        background: 'rgba(30, 34, 44, 0.7)',
        border: '1.5px solid #fff',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '10px',
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <p className="aboveInput" style={{ marginTop: '0' }}>
                Enter your card details:
            </p>
            <div style={inputWrapperStyle}>
                <CardNumberElement options={{ ...elementStyle, showIcon: true }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...inputWrapperStyle, flex: 1 }}>
                    <CardExpiryElement options={elementStyle} />
                </div>
                <div style={{ ...inputWrapperStyle, flex: 1 }}>
                    <CardCvcElement options={elementStyle} />
                </div>
            </div>
            {errorMessage && <p className="errorText">{errorMessage}</p>}
            <input
                type="submit"
                value={isProcessing ? 'Processing...' : 'Pay with Card'}
                disabled={!stripe || isProcessing}
            />
        </form>
    );
};
