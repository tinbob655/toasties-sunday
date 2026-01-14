import React from 'react';


export default function Footer():React.ReactElement {

    return (
        <React.Fragment>
            <div id="footer">
                <img src="/logo.png" className="logo" style={{height: '400px'}} />
                <p>
                    Website created by <a href="https://github.com/tinbob655" style={{textDecoration: 'underline'}}>Tinbob655</a> for the Better Server community.
                </p>
            </div>
        </React.Fragment>
    );
};