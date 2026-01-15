import axios from "axios";
import type { orderObj } from "./orderObj";


//get all the orders
export async function getOrders():Promise<orderObj[]> {
    const res = (await axios.get('/api/db/order/getOrders')).data;
    return res;
};