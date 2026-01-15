import React, {useEffect, useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { getOrder } from './ordersAPI';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import OrderPopup from './orderPopup';


export default function Orders():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const [alreadyOrdered, setAlreadyOrdered] = useState<boolean>(false);
    const [orderPopup, setOrderPopup] = useState<React.ReactElement>(<></>);


    //see if the user has already placed an order this week
    useEffect(() => {
        if (loggedIn) {
            getOrder(username).then((res) => {
                if (res) {

                    //the user has already made an order
                    setAlreadyOrdered(true);
                }
                else {
                    setAlreadyOrdered(false);
                };
            });
        };
    }, [loggedIn]);


    function orderFormSubmitted(event:React.FormEvent, setErrorMsg: (msg: string) => void) {
        event.preventDefault();
    };

    return (
        <React.Fragment>
            <PageHeader title="Orders" subtitle="Get it while its going" />

            {/*place an order section*/}
            <div className="card card-right">
                {alreadyOrdered ? (
                    <React.Fragment>

                        {/*the user has already ordered, allow them to change their order*/}
                        <h2 className="alignRight">
                            You have already ordered!
                        </h2>
                        <p className="alignRight">
                            Here is what you have ordered for this week:
                            <br/>
                        </p>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <h2 className="alignRight">
                            Place your order
                        </h2>
                        <p className="alignRight">
                            Make sure you order your food for toasties sunday! Orders will close at 13:00 on Sunday and open again at 22:00 that same day
                        </p>
                        <FancyButton text="Order here!" transformOrigin="left" action={() => {
                            setOrderPopup(<OrderPopup closeFunc={(event:React.FormEvent, setErrorMsg: (msg: string) => void) => {orderFormSubmitted(event, setErrorMsg)}} />);
                            setTimeout(() => {
                                document.getElementById('orderPopupWrapper')?.classList.add('shown');
                            }, 10);  
                        }} />
                    </React.Fragment>
                )}
            </div>

            {orderPopup}
        </React.Fragment>
    );
};