import React, {useEffect, useState} from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from './paymentAPI';
import PaymentRequestButton from './paymentRequestButton';
import CardPaymentForm from './cardPaymentForm';


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
        {username === 'NO_NAME' ? 'Donate!' : `Get your food, ${username}!`}
      </h2>
      <div className="dividerLine" style={{marginTop: '20px', marginBottom: '30px'}}></div>

      <Elements stripe={stripePromise} options={{clientSecret}}>
        <PaymentRequestButton cost={cost} clientSecret={clientSecret} closeFunc={closeFunc} username={username} />
        <div className="dividerLine" style={{marginTop: '20px', marginBottom: '20px'}}></div>
        <p style={{textAlign: 'center', marginBottom: '0'}}>Or pay with card:</p>
        <CardPaymentForm clientSecret={clientSecret} username={username} />
      </Elements>
    </div>
  );
};