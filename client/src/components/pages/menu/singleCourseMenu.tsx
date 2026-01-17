import React from 'react';
import type { courseObj } from './courseObj';


interface params {
    courseData: courseObj,
    left: boolean,
};

export default function SingleCourseMenu({courseData, left}:params):React.ReactElement {

    const alignment:string = left ? "alignLeft" : "alignRight";

    function getExtrasHTML():React.ReactElement[] {
        let tempExtrasHTML:React.ReactElement[] = [];
        courseData.extras.forEach((extra) => {
            tempExtrasHTML.push(
                <li>
                    {extra.name} for £{Number(extra.cost).toFixed(2)}
                </li>
            );
        });
        return tempExtrasHTML;
    };

    //we have valid data and it's either the main course or deserts
    if (courseData.base && courseData.base.baseCost !== -1) {
        return (
            <React.Fragment>
                <p className={alignment}>
                    For £{Number(courseData.base.baseCost).toFixed(2)} you will get {courseData.base.baseDescription}.
                    <br/>
                    You may then add any combination of the following:
                </p>
                <ul className={alignment}> 
                    {getExtrasHTML()}
                </ul>
            </React.Fragment>
        );
    }

    //we are referencing something with no default cost (drinks)
    else if (courseData.base && courseData.base.baseCost === -1) {
        return (
            <React.Fragment>
                <p className={alignment}>
                    For free you can get yourself <b>unlimited</b> water!
                    <br/>
                    If you want something actually nice, then these are your options:
                </p>
                <ul className={alignment}>
                    {getExtrasHTML()}
                </ul>
            </React.Fragment>
        );
    }

    else {
        return (
            <p className={alignment}>
                Loading...
            </p>
        );
    };
};