import React from 'react';
import './checkbox.css';

export const CheckBox = ({
    disabled = false,
    className = "rCheckbox", 
    children = null, 
    style = null, 
    checked,
    onClick = null, 
    value = "", 
    index = -1
}) => {
    const cls = ['rCheckbox'];
    const props = {};
    
    if(checked === true){
        cls.push("checked");
    }
    
    if(className !== 'rCheckbox'){
        cls.push(className);
    }
    
    if(disabled){
        cls.push('disabled');
    }
    
    if(!disabled){
        if(onClick !== null){
            props.onClick = () => {
                onClick(value, !checked, index);
            }
        }
    }
    
    if(style !== null){
        props.style = style;
    }
    
    props.className = cls.join(' ');
    
   return (
        <span {...props}>
            <span className="checkIcon"></span>
            {children}
        </span>
   ) 
}