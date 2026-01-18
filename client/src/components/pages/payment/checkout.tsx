import React from 'react';
import { useCheckout, ExpressCheckoutElement } from '@stripe/react-stripe-js/checkout';


interface params {
    closeFunc: Function,
};

export default function Checkout({closeFunc}:params):React.ReactElement {

    const checkoutState = useCheckout();

    if (checkoutState.type === 'error') {
        return (
            <p className="errorText">
                Error loading checkout
            </p>
        );
    }
    else {
        return (
            <ExpressCheckoutElement onConfirm={() => {closeFunc}} />
        );
    };
};