import React from 'react';
import { Link } from 'react-router';


interface params {
    text: string,
    destination?: string,
    action?: Function,
    transformOrigin?:string,
};

export default function FancyButton({text, destination, action, transformOrigin = 'center'}:params):React.ReactElement {
    const h3 = (
        <h3
            className="fancyButtonText"
            style={{transformOrigin}}
            onClick={action ? () => action() : undefined}
        >
            {text}
        </h3>
    );

    if (destination) {
        return (
            <Link to={destination}>
                {h3}
            </Link>
        );
    }
    return h3;
}