import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import ExpressCheckout from './expressCheckout';
import CardPaymentForm from './cardPaymentForm';


interface params {
    cost: number,
    username: string,
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const appearance: Appearance = {
    theme: 'night',
    variables: {
        colorPrimary: '#ffffff',
        fontFamily: '"Mulish", sans-serif',
        colorBackground: 'rgba(30, 34, 44, 0.85)',
        colorText: '#ffffff',
        colorTextPlaceholder: '#aab7c4',
        colorDanger: '#fa755a',
        borderRadius: '8px',
    },
    rules: {
        '.Input': {
            border: '1.5px solid #fff',
        },
    },
};

export default function PaymentPopup({cost, username}:params):React.ReactElement {

    const amountInPence = Math.round(cost * 100);

    const elementsOptions = {
        mode: 'payment' as const,
        amount: amountInPence,
        currency: 'gbp',
        appearance,
        payment_method_types: ['card', 'link'],
    };

    return (
        <div className="popupWrapper" id="paymentPopupWrapper">
            <h2>
                {username === 'NO_NAME' ? 'Donate!' : `Get your food, ${username}!`}
            </h2>
            <div className="dividerLine" style={{marginTop: '20px', marginBottom: '30px'}}></div>

            <Elements stripe={stripePromise} options={elementsOptions}>
                <ExpressCheckout cost={cost} username={username} />
            </Elements>

            <div className="dividerLine" style={{marginTop: '20px', marginBottom: '20px'}}></div>
            <p style={{textAlign: 'center', marginBottom: '0'}}>Or pay with:</p>

            <Elements stripe={stripePromise} options={elementsOptions}>
                <CardPaymentForm cost={cost} username={username} />
            </Elements>
        </div>
    );
};