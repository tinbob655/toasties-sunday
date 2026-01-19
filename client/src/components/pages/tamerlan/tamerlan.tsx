import React from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';

//import tamerlan
import a from '../../../assets/images/tamerlan/1.jpeg';
import b from '../../../assets/images/tamerlan/2.jpeg';
import c from '../../../assets/images/tamerlan/3.jpeg';
import d from '../../../assets/images/tamerlan/4.jpeg';
import e from '../../../assets/images/tamerlan/5.jpeg';
import f from '../../../assets/images/tamerlan/6.jpeg';
import g from '../../../assets/images/tamerlan/7.jpeg';
import h from '../../../assets/images/tamerlan/8.jpeg';
import i from '../../../assets/images/tamerlan/9.jpeg';
import j from '../../../assets/images/tamerlan/10.jpeg';

const images:string[] = [a, b, c, d, e, f, g, h, i, j];


export default function Tamerlan():React.ReactElement {

    function renderImages():React.ReactElement[] {
        let tempImagesHTML:React.ReactElement[] = [];
        images.forEach((image) => {
            tempImagesHTML.push(
                <React.Fragment>
                    <img src={image} style={{display: 'inline', padding: '10px'}} />
                </React.Fragment>
            );
        });
        return tempImagesHTML;
    };

    return (
        <React.Fragment>
            <PageHeader title="Tamerlan" subtitle="The Dadashov" />

            <div style={{width: '80%', marginLeft: 'auto', marginRight: 'auto'}}>
                {renderImages()}
            </div>
        </React.Fragment>
    );
};