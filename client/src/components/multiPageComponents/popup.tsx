import React from 'react';


interface params {
    wrapperId: string,
    children: React.ReactElement,
};

export default function Popup({wrapperId, children}:params):React.ReactElement {

    function closeSelf():void {
        document.getElementById(wrapperId)?.classList.remove('shown');
    };

    return (
        <React.Fragment>
            <div className="popupWrapper" id={wrapperId}>

                {/*close popup button*/}
                <button type="button" onClick={closeSelf} style={{float: 'right'}}>
                    <h3>
                        X
                    </h3>
                </button> 

                {/*popup content*/}
                {children}
            </div>
        </React.Fragment>
    );
};