import React from 'react';


interface params {
    options: {
        name: string,
        cost: number,
    }[],
};

export default function OrderCheckboxes({options}:params):React.ReactElement {

    function getOptionsHTML():React.ReactElement[] {
        let tempOptionsHTML:React.ReactElement[] = [];
        options.forEach((option) => {
            tempOptionsHTML.push(
                <React.Fragment>
                    <table style={{width: '50%', marginLeft: '50px'}}>
                        <thead>
                            <tr>
                                <td>
                                    <input type="checkbox" name={option.name} id={option.name} />
                                </td>
                                <td style={{width: '80%'}}>
                                    <label htmlFor={option.name}>
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