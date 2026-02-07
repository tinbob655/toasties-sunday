import axios from "axios";

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

//create a payment intent for Apple/Google Pay
export async function createPaymentIntent(cost: number):Promise<PaymentIntentResponse> {
    const res = (await axios.post('/api/payment/createPaymentIntent', {cost: cost})).data;
    return {
        clientSecret: res.clientSecret,
        paymentIntentId: res.paymentIntentId
    };
};

//complete payment after Stripe redirect (marks order as paid)
export async function completePaymentAfterRedirect(paymentIntentId: string): Promise<{message: string, order?: any}> {
    const res = (await axios.post('/api/payment/completePayment', { paymentIntentId })).data;
    return res;
};