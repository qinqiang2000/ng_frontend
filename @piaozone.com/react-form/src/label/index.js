import React from 'react';
import './label.css';
const Label = ({
    className="myLabel", 
    children = null, 
    style = null, 
    required = false
}) => {
    const props = {};
    let importHtml = (
        <b className="requireFlag">&nbsp;&nbsp;</b>
    );
    const cls = ['myLabel'];
    
    if(required === true){
        importHtml = (
            <b className="requireFlag">*</b>
        )
    }
    
    if(className !== 'myLabel'){
        cls.push(className);
    }
    
    if(style !== null){
        props.style = style;
    }
    
    props.className = cls.join(' ');
    
    return (
        <label {...props}>{importHtml}{children}</label>        
    )  
}

export default Label;