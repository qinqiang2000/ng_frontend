import React from 'react';

import './input.css';

const Input = ({
    disabled = false
    style = null
    className = 'myInput',
    placeholder = '请输入', 
    type = 'text',
    value = '',
    defaultValue = null,
    onChange = null,
    onFocus = null, 
    onBlur = null, 
    onKeyUp = null
}) => {
    const cls = ['myInput'];
    const props = {type, placeholder, disabled};
    
    if(className !== 'myInput'){
        cls.push(className);
    }
    
    if(!disabled){
        if(onChange !== null){
            props.onChange = onChange;    
        }
        if(onFocus !== null){
            props.onFocus = onFocus;    
        }
        if(onBlur !== null){
            props.onBlur = onBlur;    
        }
        if(onKeyUp !== null){
            props.onKeyUp = onKeyUp;    
        }
        
    }
    
    //非受控组件
    if(defaultValue !== null){
        props.defaultValue = props.defaultValue;
    }else{
        props.value = value;
    }
    
    if(style !== null){
        props.style = style;
    }
    
    props.className = cls.join(' ');
    return <input {...props} />
}

export default Input;