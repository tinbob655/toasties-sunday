import axios from "axios";
import type { orderObj } from "./orderObj";
import menuData from '../menu/menuData.json' assert {type: "json"};


//get all the orders
export async function getOrders():Promise<orderObj[]> {
    const res = (await axios.get('/api/db/order/getOrders')).data;
    return res;
};

//get a specific order by username
export async function getOrder(username: string): Promise<orderObj | null> {
    try {
        const res = (await axios.get(`/api/db/order/getOrder/${encodeURIComponent(username)}`)).data;
        return res;
    } 
    catch (err: any) {
        if (err.response && err.response.status === 404) {

            //username not found
            return null;
        }
        throw err; // Other errors
    };
};

//place a new order
export async function placeOrder(cost: number, username: string):Promise<orderObj> {

    //the user cannot make orders between 13:00 and 21:59 on a Sunday.
    const DISABLE_TIMECHECK = true;
    const currentTime: Date = new Date();
    if (!DISABLE_TIMECHECK && currentTime.getDay() === 0 && currentTime.getHours() >= 13 && currentTime.getHours() < 22) {

        //invalid time to make an order
        throw new Error("Orders cannot be placed between 1:00 PM and 9:59 PM on Sundays.");
    }
    else {
        //valid time to place an order, do so
        const res = (await axios.post(`/api/db/order/createNewOrder/${encodeURIComponent(username)}`, {cost: cost})).data;
        return res;
    };
};

//delete an order based on username
export async function deleteOrder(username: string):Promise<string> {
    const res = await axios.delete(`/api/db/order/deleteOrder/${encodeURIComponent(username)}`);
    if (res.status === 200) {
        return '';
    }
    else {
        return res.data.error;
    };
};

//edit an order based on username
export async function editOrder(username: string, newCost: number):Promise<orderObj> {
    const res = (await axios.put(`/api/db/order/editOrder/${encodeURIComponent(username)}`, {cost: newCost})).data;
    return res;
};

//extract the cost of an order from the order popup
export function extractCost(form: HTMLFormElement, setErrorMsg: Function):number {

    //work out what courses the user has selected
    const main = (form.elements.namedItem('toggleMainCourse') as HTMLInputElement)?.checked;
    const drink = (form.elements.namedItem('toggleDrinks') as HTMLInputElement)?.checked;
    const desert = (form.elements.namedItem('toggleDesert') as HTMLInputElement)?.checked;

    if (!main && !drink && !desert) {
        setErrorMsg('You must select at least one of a main, drink, or desert.');
        return -1;
    };

    //work out the cost of the user's order
    let cost: number = 0;

    // Helper to sum extras for a given suffix
    function sumExtras(extras: { name: string, cost: number }[], suffix: string): number {
        let sum = 0;
        extras.forEach(extra => {
            const checkbox = form.elements.namedItem(extra.name + suffix) as HTMLInputElement;
            if (checkbox && checkbox.checked) {
                sum += extra.cost;
            };
        });
        return sum;
    };

    // Count how many of each section exist by checking suffixes, using the correct extras array for each type
    function countSections(prefix: string, extras: { name: string, cost: number }[]): number {
        let count = 0;
        while (true) {
            const testName = extras[0]?.name + `_${prefix}_${count}`;
            const el = form.elements.namedItem(testName);
            if (el) {
                count++;
            } else {
                break;
            }
        }
        // Always at least 1 if the toggle is checked
        return count === 0 ? 1 : count;
    };

    // Count sections for each type
    const numToasties = main ? countSections('toasty', menuData.mainCourse.extras) : 0;
    const numDrinks = drink ? countSections('drink', menuData.drinks.extras) : 0;
    const numDeserts = desert ? countSections('desert', menuData.desert.extras) : 0;

    // Calculate cost for toasties
    for (let i = 0; i < numToasties; i++) {
        cost += Number(menuData.mainCourse.base.baseCost);
        cost += sumExtras(menuData.mainCourse.extras, `_toasty_${i}`);
    };

    // Calculate cost for drinks
    for (let i = 0; i < numDrinks; i++) {
        cost += Number(menuData.drinks.base.baseCost) > 0 ? Number(menuData.drinks.base.baseCost) : 0;
        cost += sumExtras(menuData.drinks.extras, `_drink_${i}`);
    };

    // Calculate cost for deserts
    for (let i = 0; i < numDeserts; i++) {
        cost += Number(menuData.desert.base.baseCost);
        cost += sumExtras(menuData.desert.extras, `_desert_${i}`);
    };

    // Always round cost to 2 decimal places (nearest penny)
    cost = Math.round(cost * 100) / 100;

    return cost;
};

//mark an order as paid
export async function payOrder(username: string):Promise<orderObj> {
    const res = (await axios.put(`/api/db/order/payOrder/${encodeURIComponent(username)}`)).data;
    return res;
}