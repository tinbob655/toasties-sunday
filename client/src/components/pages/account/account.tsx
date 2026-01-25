import React, {useState, useEffect} from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import { useAuth } from '../../../context/authContext';
import FancyButton from '../../multiPageComponents/fancyButton';
import LoginPopup from './loginPopup';
import { logOut, handleLogin, handleSignUp } from './accountAPI';

export default function Account():React.ReactElement {

    const {loggedIn, username, refreshAuth} = useAuth();
    const [sudo, setSudo] = useState<boolean>(false);
    const [loginPopup, setLoginPopup] = useState<React.ReactElement>(<></>);

    //see if the user is sudo
    useEffect(() => {
        if (!loggedIn) {
            setSudo(false);
        }
        else {
            const sudoUsers:string[] = import.meta.env.VITE_SUDO_USERS.split(',');
            setSudo(sudoUsers.includes(username));
        };
    }, [username]);


    async function loginPopupSubmitted(event: React.FormEvent, type: string, setErrorMsg: (msg: string) => void) {
        event.preventDefault();
        setErrorMsg('');

        const target = event.target as typeof event.target & {
            username: {value: string},
            password: {value: string},
            confirmPassword?: {value: string},
        };

        try {
            if (type === 'signUp') {

                //make sure passwords match
                if (target.password.value !== target.confirmPassword?.value) {
                    setErrorMsg('Passwords do not match');
                    return;
                };

                //sign up
                await handleSignUp(target.username.value, target.password.value);
                await refreshAuth();
            } 
            else {

                //login
                await handleLogin(target.username.value, target.password.value);
                await refreshAuth();
            };

            //close the popup on success
            document.getElementById('loginPopupWrapper')?.classList.remove('shown');
            setTimeout(() => {
                setLoginPopup(<></>);
            }, 1000);
        } 
        catch (err: unknown) {

            // Extract error message from axios or generic error
            let msg = 'An error occurred.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                if (axiosErr.response?.data?.message) {
                    msg = axiosErr.response.data.message;
                };
            } 
            else if (err instanceof Error) {
                msg = err.message;
            };
            setErrorMsg(msg);
        };
    };

    async function handleLogOut() {
        await logOut();
        await refreshAuth();
    };
    
    return (
        <React.Fragment>
            <PageHeader title="Account" subtitle="Sign up or log in" />

            {loggedIn ? (
                <React.Fragment>

                    {/*the user is logged in*/}
                    <div className="card card-right">
                        <h2 className="alignRight">
                            Welcome back, {username}
                        </h2>
                        <p className="alignRight">
                            You're logged into your toasties sunday account which means you are free to purchase our products!
                        </p>
                        <FancyButton text="Log out here" transformOrigin="left" action={() => {handleLogOut()}} />
                    </div>

                    {sudo ? (
                        <div className="card card-left">
                            <h2 className="alignLeft">
                                Hello, admin {username}
                            </h2>
                            <p className="alignLeft">
                                The system detected you as an admin!
                            </p>
                            <FancyButton text="View the admin page here!" transformOrigin="left" destination="/admin" />
                        </div>
                    ) : <></>}
                </React.Fragment>
            ) : (
                <React.Fragment>

                    {/*the user is not logged in*/}
                    <div className="card card-right">
                        <h2 className="alignRight">
                            Log in / sign up
                        </h2>
                        <p className="alignRight">
                            In order to access the features of this website you will need to be logged into your toasties sunday account.
                        </p>
                        <FancyButton text="Log in here!" transformOrigin="left" action={() => {
                            setLoginPopup(<LoginPopup closeFunc={(event:React.FormEvent, type:string, setErrorMsg: (msg: string) => void) => {loginPopupSubmitted(event, type, setErrorMsg)}}/>)
                            setTimeout(() => {
                                document.getElementById('loginPopupWrapper')?.classList.add('shown');
                            }, 10);
                        }} />
                    </div>
                </React.Fragment>
            )}
            {loginPopup}
        </React.Fragment>
    );
};