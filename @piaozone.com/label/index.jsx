import React from 'react';

import './label.css';
const Label = ({className="myLabel", children, style, required}) => {    
    let importHtml = (
        <b className="requireFlag">&nbsp;&nbsp;</b>
    );
    if(required === true){
        importHtml = (
            <b className="requireFlag">*</b>
        )
    }
    
    if(className !== 'myLabel'){
        className = className + ' myLabel';
    }
    
    if(style){
        return (
            <label className={className} style={style}>{importHtml}{children}</label>        
        )
    }else{
        return (
            <label className={className} style={style}>{importHtml}{children}</label>   
        )
    }    
}

export default  Label;