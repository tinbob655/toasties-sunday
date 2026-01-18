import React, {useEffect, useState} from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from './paymentAPI';
import PaymentRequestButton from './paymentRequestButton';


interface params {
    cost: number,
    username: string,
    closeFunc: Function,
};
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export default function PaymentPopup({cost, username, closeFunc}:params):React.ReactElement {

    const [clientSecret, setClientSecret] = useState<string>('');


    //get the client secret
    useEffect(() => {
        createPaymentIntent(cost).then((res) => {
          setClientSecret(res);
        });
    }, [cost]);

    if (!clientSecret) {
        return (
            <div className="popupWrapper" id="paymentPopupWrapper">
                <h2>Loading payment...</h2>
            </div>
        );
    }

  return (
    <div className="popupWrapper" id="paymentPopupWrapper">
      <h2>
        Get your food, {username}!
      </h2>
      <div className="dividerLine"></div>

      <Elements stripe={stripePromise} options={{clientSecret}}>
        <PaymentRequestButton cost={cost} clientSecret={clientSecret} closeFunc={closeFunc} />
      </Elements>
    </div>
  );
};