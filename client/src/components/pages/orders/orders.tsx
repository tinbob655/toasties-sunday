import React, {useEffect, useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { getOrder, placeOrder, deleteOrder } from './ordersAPI';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import OrderPopup from './orderPopup/orderPopup';
import menuData from '../menu/menuData.json' assert {type: "json"};
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

        console.log(userOrder);
    }, [loggedIn]);


    async function orderFormSubmitted(event: React.FormEvent, setErrorMsg: (msg: string) => void) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;

        const main = (form.elements.namedItem('toggleMainCourse') as HTMLInputElement)?.checked;
        const drink = (form.elements.namedItem('toggleDrinks') as HTMLInputElement)?.checked;
        const desert = (form.elements.namedItem('toggleDesert') as HTMLInputElement)?.checked;

        if (!main && !drink && !desert) {
            setErrorMsg('You must select at least one of a main, drink, or desert.');
            return;
        };

        //work out the cost of the user's order
        let cost: number = 0;

        // Helper to sum extras
        function sumExtras(form: HTMLFormElement, extras: { name: string, cost: number }[], prefix: string): number {
            let sum = 0;
            extras.forEach(extra => {
                const checkbox = form.elements.namedItem(prefix + extra.name) as HTMLInputElement;
                if (checkbox && checkbox.checked) {
                    sum += extra.cost;
                };
            });
            return sum;
        };

        if (main) {
            cost += menuData.mainCourse.base.baseCost;
            cost += sumExtras(form, menuData.mainCourse.extras, '');
        };

        if (drink) {
            cost += menuData.drinks.base.baseCost > 0 ? menuData.drinks.base.baseCost : 0;
            cost += sumExtras(form, menuData.drinks.extras, '');
        };

        if (desert) {
            cost += menuData.desert.base.baseCost;
            cost += sumExtras(form, menuData.desert.extras, '');
        };

        // Always round cost up to 2 decimal places
        cost = Math.ceil(cost * 100) / 100;

        
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
                            The cost of your order is currently: £{userOrder?.cost.toFixed(2)}
                        </p>
                        <FancyButton text="Remove your order" transformOrigin="left" action={removeOrder} />
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