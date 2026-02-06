import React, {useEffect, useState} from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from './paymentAPI';
import ExpressCheckout from './expressCheckout';
import CardPaymentForm from './cardPaymentForm';


interface params {
    cost: number,
    username: string,
};
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export default function PaymentPopup({cost, username}:params):React.ReactElement {

    const [clientSecret, setClientSecret] = useState<string>('');
    const [paymentIntentId, setPaymentIntentId] = useState<string>('');


    //get the client secret and payment intent ID
    useEffect(() => {
        createPaymentIntent(cost).then((res) => {
          setClientSecret(res.clientSecret);
          setPaymentIntentId(res.paymentIntentId);
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
      <React.Fragment>
        <h2>
          {username === 'NO_NAME' ? 'Donate!' : `Get your food, ${username}!`}
        </h2>
        <div className="dividerLine" style={{marginTop: '20px', marginBottom: '30px'}}></div>

        <Elements stripe={stripePromise} options={{clientSecret}}>
          <ExpressCheckout clientSecret={clientSecret} username={username} paymentIntentId={paymentIntentId} />
          <div className="dividerLine" style={{marginTop: '20px', marginBottom: '20px'}}></div>
          <p style={{textAlign: 'center', marginBottom: '0'}}>Or pay with card:</p>
          <CardPaymentForm clientSecret={clientSecret} username={username} paymentIntentId={paymentIntentId} />
        </Elements>
      </React.Fragment>
    </div>
  );
};