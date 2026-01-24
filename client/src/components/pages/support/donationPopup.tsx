import React from 'react';


interface params {
    closeFunc: Function,
};

export default function DonationPopup({closeFunc}:params):React.ReactElement {

    function getWorkImages():React.ReactElement[] {
        let tempWorkImagesHTML:React.ReactElement[] = [];

        //get all images from the making dir
        const makingImages = import.meta.glob('/src/assets/images/making/*.png', { eager: true, query: '?url', import: 'default' });
        
        //generate the HTML
        Object.values(makingImages).forEach((url, idx) => {
            tempWorkImagesHTML.push(
                <img key={idx} src={url as string} alt={`Making ${idx + 1}`} style={{borderRadius: '10px', border: '3px solid #7ec47c44'}} />
            );
        });
        return tempWorkImagesHTML;
    };

    return (
        <div className="popupWrapper" id="donationPopupWrapper">
            <h2>
                Donate now
            </h2>

            <div className="dividerLine"></div>

            {/*donation form*/}
            <form id="donationForm" onSubmit={(event:React.FormEvent) => {closeFunc(event)}}>

                <p className="aboveInput">
                    Choose amount to donate:
                </p>
                <input type="number" name="amount" step={0.01} placeholder="Enter donation amount..." min={0.50} required />

                <input type="submit" value="Donate" />
            </form>

            <div className="dividerLine"></div>

            {/*remember our hard work section*/}
            <h2>
                Remember all our hard work:
            </h2>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'flex-start', marginTop: '12px'}}>
                {getWorkImages()}
            </div>
            <p>
                Probably at least 100 hours goes into making each toasty. From manually farming the spring onions and rearing the pigs to making the cheese and bread, Will and Henry really put in their shift to get insane quality toasties to you. Sounds like you should probably donate loads of money to us...
            </p>
            <img src={new URL('../../../assets/images/tamerlan/4.jpeg', import.meta.url).href} alt="Tamerlan" />
            <p>
                Give us donations to avoid enforcement.
            </p>
        </div>
    );
};