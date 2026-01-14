import React from 'react'
import FancyButton from './fancyButton';


export default function Header():React.ReactElement {

    function getHeaderLinks():React.ReactElement[] {
        let tempHeaderLinks:React.ReactElement[] = [];
        const pages:string[] = ['home', 'menu', 'orders', 'account'];
        
        pages.forEach((page) => {
            const id:number = Math.random();
            tempHeaderLinks.push(
                <td>
                    <div onMouseOver={() => {document.getElementById(String(id))?.classList.add('expanded')}} onMouseLeave={() => {document.getElementById(String(id))?.classList.remove('expanded')}} style={{marginBottom: '10px', paddingBottom: 0}}>
                        <FancyButton text={page[0].toUpperCase() + page.slice(1)} destination={`/${page == 'home' ? '' : page}`} />
                    </div>
                    <div className="headerLine" id={String(id)}></div>
                </td>
            );
        });

        return tempHeaderLinks;
    };

    return (
        <div id="header">
            <table style={{width: '70%'}}>
                <thead>
                    <tr>
                        {getHeaderLinks()}
                    </tr>
                </thead>
            </table>
        </div>
    );
};