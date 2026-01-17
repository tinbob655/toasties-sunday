import React from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import GenericTextSection from '../../multiPageComponents/genericTextSection';
import { useAuth } from '../../../context/authContext';

export default function Home():React.ReactElement {

    const {loggedIn, username} = useAuth();

    return (
        <React.Fragment>
            <PageHeader title="Toasties Sunday" subtitle="Probably top #1 toasty product worldwide" />

            {/*menu section*/}
            <GenericTextSection header="Meet the menu" paragraph="View our menu to see what's on offer this week!" linkDestination="/menu" linkText="See our menu here" left={false} />

            {/*orders section*/}
            <GenericTextSection header="Place an order" paragraph="Place your order to get your sunday toasties!" linkDestination="/orders" linkText="Make an order" left={true} />

            {/*account section*/}
            {loggedIn ? (
                <React.Fragment>

                    {/*the user is logged in*/}
                    <GenericTextSection header={`Welcome back, ${username}`} paragraph="This would be a paragraph telling you to log in so you can make orders and stuff but you're already logged in so no need. Well done you!" linkDestination="/account" linkText="View your account here" left={false} />
                </React.Fragment>
            ) : (
                <React.Fragment>

                    {/*the user is not logged in*/}
                    <GenericTextSection header="Log in / sign up" paragraph="In order to make orders you will need to be logged into an account." linkDestination="/account" linkText="Log in here" left={false} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};