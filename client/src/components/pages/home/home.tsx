import React from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import GenericTextSection from '../../multiPageComponents/genericTextSection';

export default function Home():React.ReactElement {

    return (
        <React.Fragment>
            <PageHeader title="Toasties Sunday" subtitle="Probably top #1 toasty product worldwide" />

            {/*menu section*/}
            <GenericTextSection header="Meet the menu" paragraph="View our menu to see what's on offer this week!" linkDestination="/menu" linkText="See our menu here" left={false} />

            {/*orders section*/}
            <GenericTextSection header="Place an order" paragraph="Place your order to get your sunday toasties!" linkDestination="/orders" linkText="Make an order" left={true} />

            {/*account section*/}
            <GenericTextSection header="Log in / sign up" paragraph="In order to make orders you will need to be logged into an account." linkDestination="/account" linkText="Log in here" left={false} />
        </React.Fragment>
    );
};