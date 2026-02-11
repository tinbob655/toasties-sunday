import React from 'react';
import PageHeader from '../../multiPageComponents/pageHeader';
import menuData from '../../../../../shared/menuData.json';
import type { courseObj } from './courseObj';
import SingleCourseMenu from './singleCourseMenu';

export default function Menu():React.ReactElement {

    const mainCourseData:courseObj = menuData.mainCourse;
    const drinksData:courseObj = menuData.drinks;
    const desertData:courseObj = menuData.desert;

    return (
        <React.Fragment>
            <PageHeader title="Menu" subtitle="What's on offer" />

            {/*main course section*/}
            <div className="card card-right">
                <h2 className="alignRight">
                    Main course
                </h2>
                <SingleCourseMenu left={false} courseData={mainCourseData} />
            </div>

            <div className="dividerLine" style={{marginTop: '20px', marginBottom: '30px'}}></div>

            {/*drinks section*/}
            <div className="card card-left">
                <h2 className="alignLeft">
                    Drinks
                </h2>
                <SingleCourseMenu left={true} courseData={drinksData} />
            </div>

            <div className="dividerLine" style={{marginTop: '20px', marginBottom: '30px'}}></div>

            {/*desert section*/}
            <div className="card card-right">
                <h2 className="alignRight">
                    Deserts
                </h2>
                <SingleCourseMenu left={false} courseData={desertData} />
            </div>
        </React.Fragment>
    );
};