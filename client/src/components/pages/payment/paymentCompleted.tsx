import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import PageHeader from '../../multiPageComponents/pageHeader';
import GenericTextSection from '../../multiPageComponents/genericTextSection';
import { completePaymentAfterRedirect } from './paymentAPI';
import { useAuth } from '../../../context/authContext';


export default function PaymentCompleted():React.ReactElement {

    const [searchParams] = useSearchParams();
    const { loggedIn, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-logged-in'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        // Get payment intent from URL params (Stripe adds these after redirect)
        const paymentIntent = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');

        // Wait for auth to load
        if (authLoading) return;

        // If user isn't logged in, can't verify payment
        if (!loggedIn) {
            setStatus('not-logged-in');
            return;
        }

        // If we have payment intent info from Stripe redirect, complete the payment
        if (paymentIntent && redirectStatus === 'succeeded') {
            completePaymentAfterRedirect(paymentIntent)
                .then(() => {
                    setStatus('success');
                })
                .catch((err) => {
                    // If already paid, that's fine
                    if (err.response?.data?.message === 'Order already marked as paid') {
                        setStatus('success');
                    } else {
                        console.error('Failed to complete payment:', err);
                        setErrorMessage(err.response?.data?.error || 'Failed to verify payment');
                        setStatus('error');
                    }
                });
        } else {
            // No payment intent in URL - either direct navigation or non-redirect payment
            setStatus('success');
        }
    }, [searchParams, loggedIn, authLoading]);

    if (status === 'loading' || authLoading) {
        return (
            <React.Fragment>
                <PageHeader title="Processing..." subtitle="Please wait" />
                <div className="card card-right">
                    <p>Verifying your payment...</p>
                </div>
            </React.Fragment>
        );
    }

    if (status === 'error') {
        return (
            <React.Fragment>
                <PageHeader title="Payment Issue" subtitle="Something went wrong" />
                <div className="card card-right">
                    <p className="errorText">{errorMessage}</p>
                    <p>Your payment may have been processed. Please contact support if you continue to have issues.</p>
                </div>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <PageHeader title="Payment completed!" subtitle="Thanks for the money" />

            <GenericTextSection header="All done!" paragraph="You have bought your meal for Sunday! Me and Henry send our thanks" left={false} />
        </React.Fragment>
    );
};