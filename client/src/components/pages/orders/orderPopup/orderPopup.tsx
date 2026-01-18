import React, {useState, useRef} from 'react';
import menuData from '../../menu/menuData.json' assert {type: "json"};
import OrderCheckboxes from './orderCheckboxes';


interface params {
    closeFunc: (event: React.FormEvent, setErrorMsg: (msg: string) => void) => void,
};

export default function OrderPopup({closeFunc}:params):React.ReactElement {

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [toggleMainCourse, setToggleMainCourse] = useState<boolean>(false);
    const [toggleDrink, setToggleDrink]= useState<boolean>(false);
    const [toggleDesert, setToggleDesert] = useState<boolean>(false);
    const [additionalToasties, setAdditionalToasties] = useState<number[]>([]);
    const [additionalDeserts, setAdditionalDeserts] = useState<number[]>([]);

    const errorRef = useRef<HTMLParagraphElement>(null);

    return (
        <div className="popupWrapper" id="orderPopupWrapper">
            <h1>
                Make an order
            </h1>
            <p>
                Please check the options you will want
            </p>

            <div className="dividerLine"></div>

            <form id="orderForm" onSubmit={(event:React.FormEvent) => closeFunc(event, (msg: string) => {
                setErrorMessage(msg);
                setTimeout(() => {
                    errorRef.current?.scrollIntoView({inline: 'end', behavior: 'smooth'});
                    errorRef.current?.classList.add('playAnimation');
                }, 10);
            })}>

                {/*main course section*/}
                <React.Fragment>
                    <h1 className="alignLeft">
                        Main course:
                    </h1>

                    {/*toggle the main course*/}
                    <table style={{width: '50%', marginLeft: '10px'}}>
                        <thead>
                            <tr>
                                <td>
                                    <input type="checkbox" id="toggleMainCourse" name="toggleMainCourse" onChange={() => {setToggleMainCourse(!toggleMainCourse)}} />
                                </td>
                                <td style={{width: "80%"}}>
                                    <label htmlFor="toggleMainCourse" className="nextToCheckbox">
                                        I want a toasty (£{Number(menuData.mainCourse.base.baseCost).toFixed(2)})
                                    </label>
                                </td>
                            </tr>
                        </thead>
                    </table>

                    {toggleMainCourse ? (
                        <React.Fragment>

                            {/*the user wants a main*/}
                            <OrderCheckboxes options={menuData.mainCourse.extras} suffix="_toasty_0" />
                            {additionalToasties.map((_, arrIdx) => (
                                <div key={`toasty_${arrIdx + 1}`} style={{position: 'relative', marginTop: '10px'}}>
                                    <div className="dividerLine"></div>
                                    <button type="button" aria-label="Remove toasty" style={{position: 'absolute', top: 0, right: 0, border: 'none', background: 'none', fontSize: '1.5em', cursor: 'pointer'}} onClick={() => {
                                        setAdditionalToasties(additionalToasties.filter((_, i) => i !== arrIdx));
                                    }}>
                                        <h3>
                                            X
                                        </h3>
                                    </button>
                                    <p style={{marginLeft: '10px'}}>
                                        Toasty #{arrIdx + 2} (£{Number(menuData.mainCourse.base.baseCost).toFixed(2)})
                                    </p>
                                    <OrderCheckboxes options={menuData.mainCourse.extras} suffix={`_toasty_${arrIdx + 1}`} />
                                </div>
                            ))}
                            {/*add another toasty button*/}
                            <button type="button" onClick={() => {
                                setAdditionalToasties([...additionalToasties, additionalToasties.length + 1]);
                            }}>
                                <h3>
                                    Add another toasty here!
                                </h3>
                            </button>
                        </React.Fragment>
                    ) : <></>}
                </React.Fragment>

                <div className="dividerLine" style={{width: '90%', marginTop: '20px'}}></div>

                {/*drinks section*/}
                <React.Fragment>
                    <h1 className="alignLeft">
                        Drinks:
                    </h1>

                    {/*toggle drinks*/}
                    <table style={{width: '50%', marginLeft: '10px'}}>
                        <thead>
                            <tr>
                                <td>
                                    <input type="checkbox" id="toggleDrinks" name="toggleDrinks" onChange={() => {setToggleDrink(!toggleDrink)}} />
                                </td>
                                <td style={{width: "80%"}}>
                                    <label htmlFor="toggleDrinks" className="nextToCheckbox">
                                        I want a drink (if no you get water)
                                    </label>
                                </td>
                            </tr>
                        </thead>
                    </table>

                    {toggleDrink ? (
                        <React.Fragment>

                            {/*the user wants a drink*/}
                            <OrderCheckboxes options={menuData.drinks.extras} suffix="_drink_0" />
                        </React.Fragment>
                    ) : <></>}
                </React.Fragment>

                <div className="dividerLine" style={{width: '90%', marginTop: '20px'}}></div>

                {/*desert section*/}
                <React.Fragment>
                    <h1 className="alignLeft">
                        Desert:
                    </h1>

                    {/*toggle desert*/}
                    <table style={{width: '50%', marginLeft: '10px'}}>
                        <thead>
                            <tr>
                                <td>
                                    <input type="checkbox" id="toggleDesert" name="toggleDesert" onChange={() => {setToggleDesert(!toggleDesert)}} />
                                </td>
                                <td style={{width: "80%"}}>
                                    <label htmlFor="toggleDesert" className="nextToCheckbox">
                                        I want a waffle (£{Number(menuData.desert.base.baseCost).toFixed(2)})
                                    </label>
                                </td>
                            </tr>
                        </thead>
                    </table>

                    {toggleDesert ? (
                        <React.Fragment>

                            {/*the user wants a desert*/}
                            <OrderCheckboxes options={menuData.desert.extras} suffix="_desert_0" />
                            {additionalDeserts.map((_, arrIdx) => (
                                <div key={`desert_${arrIdx + 1}`} style={{position: 'relative', marginTop: '10px'}}>
                                    <div className="dividerLine"></div>
                                    <button type="button" aria-label="Remove waffle" style={{position: 'absolute', top: 0, right: 0, border: 'none', background: 'none', fontSize: '1.5em', cursor: 'pointer'}} onClick={() => {
                                        setAdditionalDeserts(additionalDeserts.filter((_, i) => i !== arrIdx));
                                    }}>
                                        <h3>
                                            X
                                        </h3>
                                    </button>
                                    <p style={{marginLeft: '10px'}}>
                                        Waffle #{arrIdx + 2} (£{Number(menuData.desert.base.baseCost).toFixed(2)})
                                    </p>
                                    <OrderCheckboxes options={menuData.desert.extras} suffix={`_desert_${arrIdx + 1}`} />
                                </div>
                            ))}
                            {/*add another desert button*/}
                            <button type="button" onClick={() => {
                                setAdditionalDeserts([...additionalDeserts, additionalDeserts.length + 1]);
                            }}>
                                <h3>
                                    Add another waffle here!
                                </h3>
                            </button>
                        </React.Fragment>
                    ) : <></>}
                </React.Fragment>

                {/*submit button*/}
                <input type="submit" value="Place order" style={{scale: 1.5, marginTop: '30px', marginBottom: '30px'}} />
            </form>

            <p className="errorText" ref={errorRef}>
                {errorMessage}
            </p>
        </div>
    );
};