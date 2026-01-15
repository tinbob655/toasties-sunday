import React from 'react';
import {Route, Routes} from 'react-router';


//import all routes
import Home from './components/pages/home/home';
import Account from './components/pages/account/account';
import Menu from './components/pages/menu/menu';
import Orders from './components/pages/orders/orders';
import Admin from './components/pages/admin/admin';

export default function AllRoutes():React.ReactElement {

    return (
        <Routes>
            {getRoutes()}
        </Routes>
    );
};


function getRoutes():React.ReactElement[] {
    let tempRoutesHTML:React.ReactElement[] = [];
    const routeData:[string, React.ReactElement][] = [
        ['', <Home/>],
        ['account', <Account/>],
        ['menu', <Menu/>],
        ['orders', <Orders/>],
        ['admin', <Admin/>],
    ];

    //generate routes
    routeData.forEach((route) => {
        tempRoutesHTML.push(
            <Route path={`/${route[0]}`} element={route[1]} />
        );
    });
    return tempRoutesHTML;
};