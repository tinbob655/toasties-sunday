import React, {useEffect, useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { getOrder, placeOrder, deleteOrder, editOrder, extractCost } from './ordersAPI';
import { extractOrderItems } from './ordersAPI';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import OrderPopup from './orderPopup/orderPopup';
import type { orderObj } from './orderObj';
import PaymentPopup from '../payment/paymentPopup';


export default function Orders():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const [alreadyOrdered, setAlreadyOrdered] = useState<boolean>(false);
    const [orderPopup, setOrderPopup] = useState<React.ReactElement>(<></>);
    const [userOrder, setUserOrder] = useState<orderObj|null>(null);
    const [removeOrderError, setRemoveOrderError] = useState<string>('');
    const [paymentPopup, setPaymentPopup] = useState<React.ReactElement>(<></>);


    //see if the user has already placed an order this week
    useEffect(() => {
        if (loggedIn) {
            getOrder(username).then((res) => {
                if (res) {

                    //the user has already made an order
                    setAlreadyOrdered(true);
                    setUserOrder(res);
                }
                else {
                    setAlreadyOrdered(false);
                };
            });
        };
    }, [loggedIn]);


    //handle the user creating a new order
    async function orderFormSubmitted(event: React.FormEvent, setErrorMsg: (msg: string) => void) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const cost = extractCost(form, setErrorMsg);
        const { toasties, drinks, deserts } = extractOrderItems(form);

        //place the order
        try {
            const res = await placeOrder({
                cost: cost,
                username: username,
                toasties,
                drinks,
                deserts,
                paid: false,
            });
            setAlreadyOrdered(true);
            setUserOrder(res);

            //close the popup
            document.getElementById('orderPopupWrapper')?.classList.remove('shown');
            setTimeout(() => {
                setOrderPopup(<></>);
            }, 1000);
        }
        catch (err: any) {
            let msg = 'An unexpected error occurred.';

            if (typeof err === 'string') {
                msg = err;
            } 

            else if (err && typeof err.message === 'string') {
                msg = err.message;
            };
            setErrorMsg(msg);
        };
    };


    //handle the user deleting their order
    async function removeOrder() {
        const res:string = await deleteOrder(username);

        //if we manage to delete the order successfully
        if (res === '') {
            setAlreadyOrdered(false);
            setUserOrder(null);
        }
        
        //if we couldn't delete the order
        else {
            setRemoveOrderError(res);
        };
    };


    //handle the user editing their order
    async function changeOrder(event: React.FormEvent, setErrorMsg: Function) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const cost = extractCost(form, setErrorMsg);
        const {toasties, drinks, deserts} = extractOrderItems(form);

        //edit the order
        try {
            const res = await editOrder({
                cost: cost,
                username: username,
                toasties,
                drinks,
                deserts,
            });
            setUserOrder(res);

            //close the popup
            document.getElementById('orderPopupWrapper')?.classList.remove('shown');
            setTimeout(() => {
                setOrderPopup(<></>);
            }, 1000);
        }
        catch (err) {
            setErrorMsg(err);
        };
    };


    //will fire when the user is done paying
    function paymentDone() {
    };

    return (
        <React.Fragment>
            <PageHeader title="Orders" subtitle="Get it while its going" />

            {/*place an order section*/}
            <div className="card card-right">
                {alreadyOrdered ? (
                    <React.Fragment>

                        {/*the user has already ordered*/}
                        <h2 className="alignRight">
                            You have already ordered, {userOrder?.username}!
                        </h2>
                        <p className="alignRight">
                            The cost of your order is currently: £{userOrder && userOrder.cost !== undefined ? Number(userOrder.cost).toFixed(2) : ''}
                        </p>

                        {/*pay now button*/}
                        <div style={{float: 'right', marginTop: '15px'}}>
                            <FancyButton text="Pay now!" transformOrigin="right" action={() => {
                                setPaymentPopup(
                                    <PaymentPopup username={username} cost={userOrder?.cost || -1} closeFunc={paymentDone} />
                                );
                                setTimeout(() => {
                                    document.getElementById('paymentPopupWrapper')?.classList.add('shown');
                                }, 10);
                            }} />
                        </div>

                        {/*remove order button*/}
                        <FancyButton text="Remove your order" transformOrigin="left" action={removeOrder} />

                        {/*edit order button*/}
                        <div style={{marginTop: '20px'}}>
                            <FancyButton text="Change your order" transformOrigin="left" action={() => {
                                setOrderPopup(<OrderPopup closeFunc={(event:React.FormEvent, setErrorMessage: Function) => {changeOrder(event, setErrorMessage)}} />);
                                setTimeout(() => {
                                    document.getElementById('orderPopupWrapper')?.classList.add('shown');
                                }, 10);
                            }} />
                        </div>



                        <p className="errorText">
                            {removeOrderError}
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

                        {loggedIn ? (
                            <React.Fragment>

                                {/*user is logged in*/}
                                <FancyButton text="Order here!" transformOrigin="left" action={() => {
                                    setOrderPopup(<OrderPopup closeFunc={(event:React.FormEvent, setErrorMsg: (msg: string) => void) => {orderFormSubmitted(event, setErrorMsg)}} />);
                                    setTimeout(() => {
                                        document.getElementById('orderPopupWrapper')?.classList.add('shown');
                                    }, 10);  
                                }} />
                            </React.Fragment>
                        ) : (
                            <React.Fragment>

                                {/*user is not logged in*/}
                                <FancyButton text="You need to be logged in!" transformOrigin="left" destination="/account" />
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </div>

            {orderPopup}
            {paymentPopup}
        </React.Fragment>
    );
};