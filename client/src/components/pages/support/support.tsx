import React, {useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import DonationPopup from './donationPopup';
import FancyButton from '../../multiPageComponents/fancyButton';
import PaymentPopup from '../payment/paymentPopup';


export default function Support():React.ReactElement {

    const [donationPopup, setDonationPopup] = useState<React.ReactElement>(<></>);
    const [paymentPopup, setPaymentPopup] = useState<React.ReactElement>(<></>);


    async function donationPopupSubmitted(event:React.FormEvent) {
        event.preventDefault();
        
        //get the cost
        const target = event.target as HTMLFormElement;
        const cost:number = parseFloat(target.amount.value);
        if (!cost || cost < 0.5) {
            throw new Error('Invalid or no cost');
        };

        //close the donation popup
        document.getElementById('donationPopupWrapper')?.classList.remove('shown');
        await new Promise(r => setTimeout(r, 1000));
        setDonationPopup(<></>);

        //open the payment popup with the cost
        setPaymentPopup(<PaymentPopup cost={cost} username="NO_NAME" />);
        await new Promise(r => setTimeout(r, 10));
        document.getElementById('paymentPopupWrapper')?.classList.add('shown');
    };

    return (
        <React.Fragment>
            <PageHeader title="Support us" subtitle="Give us more money so we can be richer." />

            {/*donate section*/}
            <div className="card card-right">
                <h2 className="alignRight">
                    Donate
                </h2>
                <p className="alignRight">
                    Donate now or face the music.
                </p>

                <FancyButton text="Donate here!" transformOrigin="left" action={() => {
                    setDonationPopup(<DonationPopup closeFunc={(event:React.FormEvent) => {donationPopupSubmitted(event)}} />);
                    setTimeout(() => {
                        document.getElementById('donationPopupWrapper')?.classList.add('shown');
                    }, 10);
                }} />
            </div>

            {donationPopup}
            {paymentPopup}
        </React.Fragment>
    );
};