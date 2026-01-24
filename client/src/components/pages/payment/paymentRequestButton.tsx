import React, { useEffect, useState } from 'react';
import { useStripe, PaymentRequestButtonElement, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    cost: number,
    clientSecret: string,
    closeFunc: Function,
    username: string,
};

export default function PaymentRequestButton({ cost, clientSecret, closeFunc, username }: params): React.ReactElement {

    const stripe = useStripe();
    const auth = useAuth();

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
            }
            else if (paymentIntent && paymentIntent.status === 'succeeded') {
                event.complete('success');
                // Skip database update for anonymous users
                if (username === 'NO_NAME') {
                    window.location.href = '/paymentCompleted';
                } else {
                    payOrder(auth.username).then(() => {
                        window.location.href = '/paymentCompleted';
                    });
                }
            }
            else if (paymentIntent && paymentIntent.status === 'requires_action') {
                // Handle 3D Secure or other actions
                const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
                if (actionError) {
                    event.complete('fail');
                    setErrorMessage(actionError.message || 'Payment requires additional action.');
                }
                else {
                    event.complete('success');
                    // Skip database update for anonymous users
                    if (username === 'NO_NAME') {
                        window.location.href = '/paymentCompleted';
                    } else {
                        payOrder(auth.username).then(() => {
                            window.location.href = '/paymentCompleted';
                        });
                    }
                };
            }
            else {
                event.complete('fail');
                setErrorMessage('Payment failed.');
            };
        });

    }, [stripe, clientSecret, cost, closeFunc]);

    if (!canMakePayment) {
        return (
            <div>
                <p className="errorText">{errorMessage || 'Checking payment options...'}</p>
            </div>
        );
    }

    async function handleExpressCheckoutConfirm(): Promise<void> {
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
            {/* Google Pay / Apple Pay button */}
            {paymentRequest && (
                <div style={{ marginBottom: '12px' }}>
                    <PaymentRequestButtonElement
                        options={{ paymentRequest }}
                    />
                </div>
            )}
            {/* Link button */}
            <ExpressCheckoutElement
                onConfirm={handleExpressCheckoutConfirm}
                options={{
                    paymentMethods: {
                        applePay: 'never',
                        googlePay: 'never',
                        link: 'auto',
                    },
                }}
            />
        </div>
    );
};
