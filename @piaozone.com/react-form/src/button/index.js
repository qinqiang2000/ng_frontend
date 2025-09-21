import React from 'react';
import './button.css';
export const Button = ({
    children = null, 
    style = null, 
    className = "rBtn", 
    onClick = null, 
    disabled = false, 
    onMouseOver = null, 
    onMouseOut = null
}) => {
    const cls = ['rBtn'];
    const props = {};
    
    if(className !== "rBtn"){
        cls.push(className);
    }
    
    if(!disabled){
        if(onClick !== null){
            props.onClick = onClick;    
        }
        if(onMouseOver !== null){
            props.onMouseOver = onMouseOver;
        }
        
        if(onMouseOut !== null){
            props.onMouseOut = onMouseOut; 
        }        
    }else{
        cls.push('disabled');
    }
    
    if(style !== null){
        props.style = style;
    }
    
    props.className = cls.join(' ');
    
    return (
        <button {...props}>{children}</button>
    )
}

export const IconButton = ({
    children = null, 
    style = null, 
    className = 'rIconBtn',
    type = '', //add, download
    disabled = false
    onClick = null
}) => {
    const cls = ['rIconBtn'];
    const props = {};
    
    if(className !== 'rIconBtn'){
        cls.push(className);
    }
    
    if(style !== null){
        props.style = style;    
    }
    
    if(!disabled){
        if(onClick !== null){
            props.onClick = onClick
        }    
    }else{
        cls.push('disabled');
    }
    
    props.className = cls.join(' ');
    
    return (
        <a href="javascript:;" {...props}>
            {
                type !== ''?
                (
                    <span className={type + 'Icon' + ' icon'}></span>
                ):null                
            }
            {children}
        </a>
    )
}