import React, {useEffect, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../multiPageComponents/pageHeader';
import { useAuth } from '../../../context/authContext';
import GenericTextSection from '../../multiPageComponents/genericTextSection';
import { getOrders } from '../orders/ordersAPI';


//helper to format order items nicely
function formatOrderItems(items: string[], marker: string, label: string): React.ReactElement[] {
    const result: React.ReactElement[] = [];
    let currentGroup: string[] = [];
    let groupIndex = 0;

    items.forEach((item, i) => {
        if (item === marker) {
            if (i > 0 || currentGroup.length > 0) {
                // Push previous group as a bullet point
                result.push(
                    <li key={`${label}-${groupIndex}`} style={{marginLeft: '10px'}}>
                        <strong>{label} #{groupIndex + 1}:</strong> {currentGroup.length > 0 ? currentGroup.join(', ') : 'Plain'}
                    </li>
                );
                groupIndex++;
                currentGroup = [];
            }
        } else {
            currentGroup.push(item);
        }
    });
    // Push last group
    if (items.length > 0) {
        result.push(
            <li key={`${label}-${groupIndex}`} style={{marginLeft: '10px'}}>
                <strong>{label} #{groupIndex + 1}:</strong> {currentGroup.length > 0 ? currentGroup.join(', ') : 'Plain'}
            </li>
        );
    }
    return result;
}

function formatDrinks(drinks: string[]): React.ReactElement[] {
    if (!drinks || drinks.length === 0) return [];
    return drinks.map((drink, i) => (
        <li key={`Drink-${i}`} style={{marginLeft: '10px'}}>
            <strong>Drink:</strong> {drink}
        </li>
    ));
}



export default function Admin():React.ReactElement {

    const {loggedIn, username} = useAuth();
    const [sudo, setSudo] = useState<boolean>(false);
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


    //use React Query to fetch and cache all orders
    const { data: orders = [] } = useQuery({
        queryKey: ['allOrders'],
        queryFn: getOrders,
        enabled: sudo, //only fetch when user is sudo
        staleTime: 2 * 60 * 1000, //consider data fresh for 2 minutes
    });

    
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
                        <React.Fragment key={order.username}>
                            <br/>
                            <li style={{marginBottom: '15px', listStyle: 'none'}}>
                                <strong>{order.username}</strong>
                            </li>
                            {formatOrderItems(order.toasties || [], 'NEW TOASTY', 'Toasty')}
                            {formatDrinks(order.drinks || [])}
                            {formatOrderItems(order.deserts || [], 'NEW DESERT', 'Waffle')}
                        </React.Fragment>
                    );
                };
            });
            setOrdersHTML(tempOrdersHTML);
        };
    }, [orders]);


    function getIngredients(): React.ReactElement {
        // Aggregate counts across all paid orders
        const ingredientCounts: Map<string, number> = new Map();
        let totalToasties = 0;
        let totalDrinks = 0;
        let totalWaffles = 0;

        orders.forEach((order) => {
            if (!order.paid) return;

            // Count toasties and their ingredients
            if (order.toasties && order.toasties.length > 0) {
                order.toasties.forEach((item) => {
                    if (item === 'NEW TOASTY') {
                        totalToasties++;
                    } else {
                        ingredientCounts.set(item, (ingredientCounts.get(item) || 0) + 1);
                    }
                });
            }

            // Count drinks
            if (order.drinks && order.drinks.length > 0) {
                order.drinks.forEach((drink) => {
                    totalDrinks++;
                    ingredientCounts.set(drink, (ingredientCounts.get(drink) || 0) + 1);
                });
            }

            // Count waffles (deserts) and their toppings
            if (order.deserts && order.deserts.length > 0) {
                order.deserts.forEach((item) => {
                    if (item === 'NEW DESERT') {
                        totalWaffles++;
                    } else {
                        ingredientCounts.set(item, (ingredientCounts.get(item) || 0) + 1);
                    }
                });
            }
        });

        // Build the JSX
        const toastyIngredients: React.ReactElement[] = [];
        const drinkItems: React.ReactElement[] = [];
        const waffleIngredients: React.ReactElement[] = [];

        // Separate ingredients by category (we need to identify which belong to which)
        // For simplicity, we'll group toasty ingredients, drink items, and waffle toppings
        // Since drinks are standalone items, we list them separately
        // Toasty and waffle ingredients are extras

        ingredientCounts.forEach((count, ingredient) => {
            // Check if it's a drink by seeing if it appears in the drinks arrays
            const isDrink = orders.some(
                (order) => order.paid && order.drinks && order.drinks.includes(ingredient)
            );
            const isToastyIngredient = orders.some(
                (order) =>
                    order.paid &&
                    order.toasties &&
                    order.toasties.includes(ingredient) &&
                    ingredient !== 'NEW TOASTY'
            );
            const isWaffleIngredient = orders.some(
                (order) =>
                    order.paid &&
                    order.deserts &&
                    order.deserts.includes(ingredient) &&
                    ingredient !== 'NEW DESERT'
            );

            if (isDrink) {
                drinkItems.push(
                    <li key={`drink-${ingredient}`}>{count}x {ingredient}</li>
                );
            }
            if (isToastyIngredient) {
                toastyIngredients.push(
                    <li key={`toasty-ing-${ingredient}`}>{count}x {ingredient}</li>
                );
            }
            if (isWaffleIngredient) {
                waffleIngredients.push(
                    <li key={`waffle-ing-${ingredient}`}>{count}x {ingredient}</li>
                );
            }
        });

        return (
            <ul className="alignLeft">
                {totalToasties > 0 && (
                    <>
                        <li style={{ listStyle: 'none' }}><strong>{totalToasties}x Toasty</strong></li>
                        <ul style={{ marginLeft: '20px' }}>
                            {toastyIngredients}
                        </ul>
                    </>
                )}
                {totalToasties > 0 && totalDrinks > 0 && <br />}
                {totalDrinks > 0 && (
                    <>
                        <li style={{ listStyle: 'none' }}><strong>{totalDrinks}x Drink</strong></li>
                        <ul style={{ marginLeft: '20px' }}>
                            {drinkItems}
                        </ul>
                    </>
                )}
                {(totalToasties > 0 || totalDrinks > 0) && totalWaffles > 0 && <br />}
                {totalWaffles > 0 && (
                    <>
                        <li style={{ listStyle: 'none' }}><strong>{totalWaffles}x Waffle</strong></li>
                        <ul style={{ marginLeft: '20px' }}>
                            {waffleIngredients}
                        </ul>
                    </>
                )}
                {totalToasties === 0 && totalDrinks === 0 && totalWaffles === 0 && (
                    <li>No paid orders yet.</li>
                )}
            </ul>
        );
    };

    return (
        <React.Fragment>
            <PageHeader title="Admin" subtitle="This is the admin page!" />

            {/*make sure the user is sudo*/}
            {sudo ? (
                <React.Fragment>

                    {/*the user is sudo*/}
                    {/*orders section*/}
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

                    {/*ingredients section*/}
                    <div className="card card-left">
                        <h2 className="alignLeft">
                            Ingredients required:
                        </h2>
                        {getIngredients()}
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