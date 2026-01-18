import React, {useEffect, useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { getOrder, placeOrder, deleteOrder, editOrder, extractCost } from './ordersAPI';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import OrderPopup from './orderPopup/orderPopup';
import type { orderObj } from './orderObj';


export default function Orders():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const [alreadyOrdered, setAlreadyOrdered] = useState<boolean>(false);
    const [orderPopup, setOrderPopup] = useState<React.ReactElement>(<></>);
    const [userOrder, setUserOrder] = useState<orderObj|null>(null);
    const [removeOrderError, setRemoveOrderError] = useState<string>('');


    //see if the user has already placed an order this week
    useEffect(() => {
        if (loggedIn) {
            getOrder(username).then((res) => {
                if (res) {

                    //the user has already made an order
                    setAlreadyOrdered(true);
                    setUserOrder({
                        username: res.username,
                        cost: res.cost,
                    });
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

        
        //place the order
        try {
            const res = await placeOrder(cost, username);
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

        //edit the order
        try {
            const res = await editOrder(username, cost);
            console.log(res);
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

    return (
        <React.Fragment>
            <PageHeader title="Orders" subtitle="Get it while its going" />

            {/*place an order section*/}
            <div className="card card-right">
                {alreadyOrdered ? (
                    <React.Fragment>

                        {/*the user has already ordered, allow them to change their order*/}
                        <h2 className="alignRight">
                            You have already ordered, {userOrder?.username}!
                        </h2>
                        <p className="alignRight">
                            The cost of your order is currently: £{userOrder && userOrder.cost !== undefined ? Number(userOrder.cost).toFixed(2) : ''}
                        </p>
                        <FancyButton text="Remove your order" transformOrigin="left" action={removeOrder} />

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