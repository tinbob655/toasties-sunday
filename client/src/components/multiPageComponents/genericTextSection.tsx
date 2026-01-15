import React from 'react';
import FancyButton from './fancyButton';


interface params {
    header: string,
    paragraph: string,
    linkDestination?: string,
    linkText?: string,
    left: Boolean,
    headerImage?:string,
};

export default function GenericTextSection({header, paragraph, linkDestination, linkText, left, headerImage}:params):React.ReactElement {
    const alignment:string = left ? "alignLeft" : "alignRight";

    function getLink():React.ReactElement {
        let tempLink:React.ReactElement = <></>;
        if (linkDestination && linkText) {
            tempLink = (
                <FancyButton text={linkText} destination={linkDestination} transformOrigin="left" />
            )
        };
        return tempLink;
    };

    // Add a class to control rotation direction
    const cardClass = `card ${left ? 'card-left' : 'card-right'}`;
    return (
        <div className={cardClass}>
            <table style={{width: '25%', tableLayout: 'unset', marginLeft: left ? 0 : 'auto'}}>
                <thead>
                    <tr>
                        <td>
                            <h2 className={alignment}>
                                {header}
                            </h2>
                        </td>
                        {headerImage ? (
                            <td>
                                <img src={headerImage} className="rounded" style={{width: '50px'}} />
                            </td>
                        ) : <></>}
                    </tr>
                </thead>
            </table>

            <p className={`fancy ${alignment}`}>
                {paragraph}
            </p>
            {getLink()}
        </div>
    );
};