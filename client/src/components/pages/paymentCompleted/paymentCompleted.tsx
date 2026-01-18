import React from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import GenericTextSection from '../../multiPageComponents/genericTextSection';


export default function PaymentCompleted():React.ReactElement {

    return (
        <React.Fragment>
            <PageHeader title="Payment completed!" subtitle="Thanks for the money" />

            <GenericTextSection header="All done!" paragraph="You have bought your meal for Sunday! Me and Henry send our thanks" left={false} />
        </React.Fragment>
    );
};