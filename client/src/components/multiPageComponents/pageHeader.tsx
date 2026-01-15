import React from 'react';


interface params {
    title: string,
    subtitle: string,
};

export default function PageHeader({title, subtitle}:params):React.ReactElement {

    return (
        <div className="pageHeaderGlass">
            <h1 className="alignLeft pageHeaderTitle">
                {title}
            </h1>
            <p className="alignLeft pageHeaderSubtitle fancy">
                {subtitle}
            </p>
        </div>
    );
};