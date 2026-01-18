import React from 'react';


interface params {
    options: {
        name: string,
        cost: number,
    }[],
    suffix?: string,
};

export default function OrderCheckboxes({options, suffix = ''}:params):React.ReactElement {

    function getOptionsHTML():React.ReactElement[] {
        let tempOptionsHTML:React.ReactElement[] = [];
        options.forEach((option, idx) => {
            const inputName = option.name + suffix;
            const inputId = option.name + suffix;
            tempOptionsHTML.push(
                <React.Fragment key={inputId}>
                    <table style={{width: '50%', marginLeft: '50px'}}>
                        <thead>
                            <tr>
                                <td>
                                    <input type="checkbox" name={inputName} id={inputId} />
                                </td>
                                <td style={{width: '80%'}}>
                                    <label htmlFor={inputId}>
                                        {option.name} for £{Number(option.cost).toFixed(2)}
                                    </label>
                                </td>
                            </tr>
                        </thead>
                    </table>
                </React.Fragment>
            );
        });
        return tempOptionsHTML;
    };

    return (
        <React.Fragment>
            <h2 style={{fontSize: '20px', marginLeft: '20px'}} className="alignLeft">
                {options.some(option => option.name === 'Coffee') ? "Options:" : "Extras:"}
            </h2>
            {getOptionsHTML()}
        </React.Fragment>
    );
};