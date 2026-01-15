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
            // Username not found
            return null;
        }
        throw err; // Other errors
    };
}