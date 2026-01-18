import axios from "axios";


//create a payment intent for Apple/Google Pay
export async function createPaymentIntent(cost: number):Promise<string> {
    const res = (await axios.post('/api/payment/createPaymentIntent', {cost: cost})).data;
    return res.clientSecret;
};