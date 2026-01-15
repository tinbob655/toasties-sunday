import React, {useRef, useState} from 'react';


interface params {
    closeFunc: (event: React.FormEvent, type: string, setErrorMsg: (msg: string) => void) => void;
}

export default function LoginPopup({closeFunc}:params):React.ReactElement {


    const loginWrapper = useRef<HTMLDivElement>(null);
    const signUpWrapper = useRef<HTMLDivElement>(null);
    const [activeForm, setActiveForm] = useState<'login' | 'signUp'>('login');
    const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');
    const [signUpErrorMsg, setSignUpErrorMsg] = useState<string>('');

    function loginSelected(): void {
        setActiveForm('login');
    };

    function signUpSelected(): void {
        setActiveForm('signUp');
    };

    return (
        <div className="popupWrapper" id="loginPopupWrapper">
            <h2>
                Log in / sign up
            </h2>

            <div className="dividerLine"></div>

            <table>
                <thead>
                    <tr>
                        <td>
                            <button onClick={loginSelected} type="button">
                                <h3>
                                    Login
                                </h3>
                            </button>
                        </td>
                        <td>
                            <button onClick={signUpSelected} type="button">
                                <h3>
                                    Sign up
                                </h3>
                            </button>
                        </td>
                    </tr>
                </thead>
            </table>

            <div className="formSliderContainer">
                <div
                    className="formSlider"
                    style={{
                        transform: activeForm === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
                        transition: 'transform 0.5s cubic-bezier(0.77,0,0.175,1)',
                    }}
                >
                    <div id="loginWrapper" ref={loginWrapper} className="formPanel">
                        <form id="loginForm" onSubmit={(event) => {closeFunc(event, 'login', setLoginErrorMsg)}}>
                            <p className="aboveInput">
                                Enter username:
                            </p>
                            <input name="username" type="text" placeholder="Username..." required />

                            <p className="aboveInput">
                                Enter password:
                            </p>
                            <input name="password" type="password" placeholder="Password..." required />

                            <p className="errorText">
                                {loginErrorMsg}
                            </p>

                            <input type="submit" value="Submit" style={{marginTop: '20px'}} />
                        </form>
                    </div>

                    <div id="signUpWrapper" ref={signUpWrapper} className="formPanel">
                        <form id="signUpForm" onSubmit={(event) => {closeFunc(event, 'signUp', setSignUpErrorMsg)}}>
                            <p className="aboveInput">
                                Create username:
                            </p>
                            <input type="text" name="username" placeholder="Username..." required />

                            <p className="aboveInput">
                                Create password:
                            </p>
                            <input type="password" name="password" placeholder="Password..." required />

                            <p className="aboveInput">
                                Confirm password:
                            </p>
                            <input type="password" name="confirmPassword" placeholder="Password... " required />

                            <p className="errorText">
                                {signUpErrorMsg}
                            </p>

                            <input type="submit" value="Submit" style={{marginTop: '20px'}} />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}