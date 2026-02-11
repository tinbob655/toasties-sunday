import axios from "axios";

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

//create a payment intent
//for orders: cost is looked up server-side from the user's order
//for donations: cost is provided by the client
export async function createPaymentIntent(options?: { cost?: number, isDonation?: boolean }):Promise<PaymentIntentResponse> {
    const res = (await axios.post('/api/payment/createPaymentIntent', options ?? {})).data;
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