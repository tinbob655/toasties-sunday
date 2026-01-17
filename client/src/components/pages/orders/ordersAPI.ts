import axios from "axios";
import type { orderObj } from "./orderObj";


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
    const currentTime: Date = new Date();
    if (currentTime.getDay() === 0 && currentTime.getHours() >= 13 && currentTime.getHours() < 22) {

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
}