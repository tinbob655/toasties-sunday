import React from 'react';
import { useCheckout, ExpressCheckoutElement } from '@stripe/react-stripe-js/checkout';
import { payOrder } from '../orders/ordersAPI';
import { useAuth } from '../../../context/authContext';


interface params {
    closeFunc: Function,
};

export default function Checkout({closeFunc}:params):React.ReactElement {

    const {loggedIn, username} = useAuth();

    async function afterPaid():Promise<void> {

        //only do anything if we are logged in
        if (loggedIn) {

            //mark the user's order as paid
            await payOrder(username);
            closeFunc();
        }
        else {
            throw new Error('User was not logged in, cannot mark order as paid');
        };
    };

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
            <ExpressCheckoutElement onConfirm={() => {afterPaid}} />
        );
    };
};