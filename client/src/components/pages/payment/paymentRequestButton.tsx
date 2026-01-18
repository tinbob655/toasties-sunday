import React, { useEffect, useState } from 'react';
import { useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js';


interface params {
    cost: number,
    clientSecret: string,
    closeFunc: Function,
};

export default function PaymentRequestButton({ cost, clientSecret, closeFunc }: params): React.ReactElement {

    const stripe = useStripe();
    const [paymentRequest, setPaymentRequest] = useState<any>(null);
    const [canMakePayment, setCanMakePayment] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!stripe || !clientSecret) return;

        // Create a PaymentRequest object
        const pr = stripe.paymentRequest({
            country: 'GB',
            currency: 'gbp',
            total: {
                label: 'Toasties Sunday Order',
                amount: Math.round(cost * 100), // amount in pence
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });

        // Check if Apple Pay or Google Pay is available
        pr.canMakePayment().then((result) => {
            if (result) {
                setPaymentRequest(pr);
                setCanMakePayment(true);
            } else {
                setErrorMessage('Apple Pay and Google Pay are not available on this device/browser.');
            }
        });

        // Handle the payment method event
        pr.on('paymentmethod', async (event) => {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: event.paymentMethod.id },
                { handleActions: false }
            );

            if (error) {
                event.complete('fail');
                setErrorMessage(error.message || 'Payment failed.');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                event.complete('success');
                closeFunc();
            } else if (paymentIntent && paymentIntent.status === 'requires_action') {
                // Handle 3D Secure or other actions
                const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
                if (actionError) {
                    event.complete('fail');
                    setErrorMessage(actionError.message || 'Payment requires additional action.');
                } else {
                    event.complete('success');
                    closeFunc();
                }
            } else {
                event.complete('fail');
                setErrorMessage('Payment failed.');
            }
        });

    }, [stripe, clientSecret, cost, closeFunc]);

    if (!canMakePayment) {
        return (
            <div>
                <p className="errorText">{errorMessage || 'Checking payment options...'}</p>
            </div>
        );
    }

    return (
        <div>
            {paymentRequest && (
                <PaymentRequestButtonElement
                    options={{ paymentRequest }}
                />
            )}
        </div>
    );
};
