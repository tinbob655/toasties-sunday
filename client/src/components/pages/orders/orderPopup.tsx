import React, {useState} from 'react';


interface params {
    closeFunc: (event: React.FormEvent, setErrorMsg: (msg: string) => void) => void;
};

export default function OrderPopup({closeFunc}:params):React.ReactElement {

    const [errorMessage, setErrorMessage] = useState<string>('');

    return (
        <div className="popupWrapper" id="orderPopupWrapper">
            <h2>
                Make an order
            </h2>

            <div className="dividerLine"></div>

            <form id="orderForm" onSubmit={(event:React.FormEvent) => closeFunc(event, setErrorMessage)}>
                <p>
                    Please check the items you will want in your toasty
                </p>
            </form>

            <p className="errorText">
                {errorMessage}
            </p>
        </div>
    );
};