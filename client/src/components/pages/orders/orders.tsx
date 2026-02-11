import React, {useState} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../multiPageComponents/pageHeader';
import { getOrder, placeOrder, deleteOrder, editOrder, extractCost } from './ordersAPI';
import { extractOrderItems } from './ordersAPI';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import OrderPopup from './orderPopup/orderPopup';
import PaymentPopup from '../payment/paymentPopup';
import { useNavigate } from 'react-router';


export default function Orders():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [orderPopup, setOrderPopup] = useState<React.ReactElement>(<></>);
    const [removeOrderError, setRemoveOrderError] = useState<string>('');
    const [paymentPopup, setPaymentPopup] = useState<React.ReactElement>(<></>);

    //use React Query to fetch and cache the user's order
    const { data: userOrder, isLoading: orderLoading } = useQuery({
        queryKey: ['userOrder', username],
        queryFn: () => getOrder(username),
        enabled: loggedIn && !!username, //only fetch when logged in
        staleTime: 5 * 60 * 1000, //consider data fresh for 5 minutes
    });

    const alreadyOrdered = !!userOrder;


    //handle the user creating a new order
    async function orderFormSubmitted(event: React.FormEvent, setErrorMsg: (msg: string) => void) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;

        //validate that at least one category is selected (cost is calculated server-side)
        const validationCost = extractCost(form, setErrorMsg);
        if (validationCost === -1) return;

        const { toasties, drinks, deserts } = extractOrderItems(form);

        //place the order
        try {
            const res = await placeOrder({
                username: username,
                toasties,
                drinks,
                deserts,
            });

            //invalidate and update the cache with the new order
            queryClient.setQueryData(['userOrder', username], res);

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

            //clear the cached order
            queryClient.setQueryData(['userOrder', username], null);
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

        //validate that at least one category is selected (cost is calculated server-side)
        const validationCost = extractCost(form, setErrorMsg);
        if (validationCost === -1) return;

        const {toasties, drinks, deserts} = extractOrderItems(form);

        //edit the order
        try {
            const res = await editOrder({
                username: username,
                toasties,
                drinks,
                deserts,
            });

            //update the cache with the edited order
            queryClient.setQueryData(['userOrder', username], res);

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

    //show loading state while fetching order
    if (loggedIn && orderLoading) {
        return (
            <React.Fragment>
                <PageHeader title="Orders" subtitle="Get it while its going" />
                <div className="card card-right">
                    <p>Loading your order...</p>
                </div>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <PageHeader title="Orders" subtitle="Get it while its going" />

            {/*place an order section*/}
            <div className="card card-right">
                {alreadyOrdered ? (
                    <React.Fragment>

                        {/*the user has already ordered*/}
                        <h2 className="alignRight">

                            {/*secret tamerlan button*/}
                            <span onDoubleClick={() => {navigate('/tamerlan')}} style={{color:  '#a1b6a0', cursor: 'pointer'}} >
                                W
                            </span>
                            e have your order, {userOrder?.username}!
                        </h2>
                        {userOrder?.paid ? (
                            <React.Fragment>
                                <p className="alignRight">
                                    You've paid for your order! You will be able to edit it again next week.
                                </p>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <p className="alignRight">
                                    The cost of your order is currently: £{userOrder && userOrder.cost !== undefined ? Number(userOrder.cost).toFixed(2) : ''}
                                </p>

                                {/*pay now button*/}
                                <div style={{float: 'right', marginTop: '15px'}}>
                                    <FancyButton text="Pay now!" transformOrigin="right" action={() => {
                                        setPaymentPopup(
                                            <PaymentPopup username={username} cost={userOrder?.cost || -1} />
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
                        )}
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