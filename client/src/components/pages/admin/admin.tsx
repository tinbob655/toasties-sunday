import React, {useEffect, useState} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { useAuth } from '../../../context/authContext';
import GenericTextSection from '../../multiPageComponents/genericTextSection';
import { getOrders } from '../orders/ordersAPI';
import type { orderObj } from '../orders/orderObj';


export default function Admin():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const [sudo, setSudo] = useState<boolean>(false);
    const [orders, setOrders] = useState<orderObj[]>([]);
    const [ordersHTML, setOrdersHTML] = useState<React.ReactElement[]>([]);

    //see if the user is sudo
    useEffect(() => {
        if (!loggedIn) {
            setSudo(false);
        }
        else {
            const sudoUsers:string[] = import.meta.env.VITE_SUDO_USERS.split(',');
            setSudo(sudoUsers.includes(username));
        };
    }, [username]);


    //fetch all the orders if we detect a sudo user
    useEffect(() => {
        if (sudo) {
            getOrders().then((res) => {
                console.log(res);
                setOrders(res);
            });
        };
    }, [sudo]);

    
    //when we get orders, update the frontend
    useEffect(() => {

        //only fire if we have at least one order
        if (orders && orders.length >= 1) {
            let tempOrdersHTML:React.ReactElement[] = [];

            //generate markup
            orders.forEach((order) => {

                //only show paid-for orders
                if (order.paid) {
                    tempOrdersHTML.push(
                        <React.Fragment>
                            <li>
                                {order.username} bought an order worth £{order.cost}
                            </li>
                        </React.Fragment>
                    );
                };
            });
            setOrdersHTML(tempOrdersHTML);
        };
    }, [orders]);

    return (
        <React.Fragment>
            <PageHeader title="Admin" subtitle="This is the admin page!" />

            {/*make sure the user is sudo*/}
            {sudo ? (
                <React.Fragment>

                    {/*the user is sudo*/}
                    <div className="card card-right">
                        <h2 className="alignRight">
                            Hello, Admin {username}
                        </h2>
                        <p className="alignRight">
                            This weeks orders are:
                        </p>
                        <ul className="alignLeft">
                            {ordersHTML}
                        </ul>
                    </div>
                </React.Fragment>
            ) : (
                <React.Fragment>

                    {/*the user is not sudo*/}
                    <GenericTextSection header="You are not an admin" paragraph="You need to be an admin in order to access the content of this page. If you are not an admin then please go away, if you think you should be an admin then log in below." linkDestination="/account" linkText="Log in here" left={true} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};