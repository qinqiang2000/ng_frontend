import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import {getElementRect, isChild} from '../../utils/domHelps';

const SelectContext = React.createContext('kdSelect');
export class OptionGroup extends React.Component{
    constructor(props) {
        super(props);
        this.container = document.createElement('div');        
        //this.container.style = "position:absolute;left:0;top:0;width:100%";
        document.body.appendChild(this.container);
        
        
    }
    componentWillUnmount() {
        document.body.removeChild(this.container);
        this.container = null;
    }
    
    render(){        
        const {x, y, width, children, show, listMaxHeight} = this.props;
        let cls = this.props.preCls+'select-list';
        if(this.props.show){
            cls +=' focus';
        }
        return ReactDOM.createPortal(
            <ul className={cls} style={{maxHeight: listMaxHeight+'px',position:'absolute', left: x+ 'px', top: y+'px', width:width+'px', display:show?'block':'none'}}>
                {children}
            </ul>
        ,this.container);
    }    
}

export class Option extends React.Component{
    constructor(){
        super(...arguments);
        this.onClickOption = this.onClickOption.bind(this);
    }
    
    onClickOption(e, f){                
        e.stopPropagation();          
        f(this.props.value, this.props.children);        
    }
    
    getClassName(preCls, curValue, value){
        let cls = preCls + 'option';
        if(curValue === value){
            cls +=' active';
        }
        return cls;
    }
    
    render(){        
        const {children, value} = this.props;        
        return (
             <SelectContext.Consumer>
             {
                context => (
                    <li 
                        onClick={(e)=>{this.onClickOption(e, context.onChange)}} 
                        value={value} 
                        className={this.getClassName(context.preCls, context.curValue, value)}
                    >
                        {children}
                    </li>
                )                                  
             }                
            </SelectContext.Consumer>
        )
    }
}


export class Select extends React.Component{
    constructor(){
        super(...arguments);
        
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.preCls = this.props.preCls || "kd-default-";
        
        //初始化后不再删除
        this.isInitOptions =  false;
        
        //初始化select值
        let value = this.props.value || '';
        let children = this.props.text || '';
        let childrens = this.props.children;        
        if(this.props.children){            
            if(value === ''){
                value = childrens[0].props.value;
                children = childrens[0].props.children;             
            }else{
                for(let i=0; i<childrens.length; i++){
                    if(childrens[i].props.value === value){
                        children = childrens[i].props.children;
                    }
                }
            }
            
            if(value === ''){
                value = childrens[0].props.value;
                children = childrens[0].props.children;
            }
        }
        
        this.state = {
            disabled: this.props.disabled,
            focus: false,
            value,
            text: children,
            x:0,
            y:0
        }
    }
    
    //当元素失去焦点时触发
    onBlur(e){         
        if (!Element.prototype.matches) {
            Element.prototype.matches =
              Element.prototype.matchesSelector ||
              Element.prototype.mozMatchesSelector ||
              Element.prototype.msMatchesSelector ||
              Element.prototype.oMatchesSelector ||
              Element.prototype.webkitMatchesSelector ||
              function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                  i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;            
              };
          }     
        //点击了列表中元素，或者点击当前元素
        if((e.target && e.target.matches('li.'+ this.preCls+ 'option')) || isChild(e.target, this.refs.select)){
            return false;           
        }
        
        this.setState({
           focus:false
        });
        
        if(typeof this.props.onBlur === 'function'){
           this.props.onBlur();
        }
              
    }
    
    //当元素获得焦点时触发
    onFocus(e){ 
        if(!this.state.disabled){
            const locInfo = getElementRect(this.refs.select);   
            this.isInitOptions = true;
            this.setState({
                x: locInfo.x,
                y: locInfo.y,
                width: locInfo.width,
                height: locInfo.height,
                focus: true
            });
            
            if(typeof this.props.onFocus === 'function'){
               this.props.onBlur();
            }
        }
        
    }
    
    //点击选择下拉框时触发
    onChange(v, t){
        //如果值发生变化，触发父元素的onChange事件
        if(this.state.value !== v){
            this.setState({
                focus: false,
                value:v,
                text:t
            });   
            
            if(typeof this.props.onChange === 'function'){
                this.props.onChange(v, t);
            }
        }else{
            this.setState({
                focus: false                              
            });
        }
    }
    
    componentDidMount(){
        document.body.addEventListener('click', this.onBlur); 
        const locInfo = getElementRect(this.refs.select);        
        this.setState({
            ...locInfo
        });
    }
    
    componentWillUnmount(){
        document.body.removeEventListener('click', this.onBlur); 
    }
    
    componentWillReceiveProps(props){
        if(props.disabled !== this.state.disabled){
            this.setState({
                disabled: props.disabled
            })
        }
    }
    
    render(){
        const {children, style, listMaxHeight} = this.props;
        
        const {focus, value, text, x, y, width, height} = this.state;
        const preCls = this.preCls;
        let disabledCls = this.state.disabled?' disabled ':'';
        return (
            <SelectContext.Provider value={{preCls:preCls, curValue: value, onChange: this.onChange}}>
                <div className={focus? preCls + "box focus" + disabledCls : disabledCls + preCls + "box"} onClick={this.onFocus} ref="select" style={style?style:{}}>
                    <div className={preCls + "value"}>{text}</div>
                    <div className={preCls + "arrow"}></div>
                    {
                        this.isInitOptions && children?(
                            <OptionGroup preCls={preCls} x={x} y={y+height} width={width} show={focus} listMaxHeight={listMaxHeight}>
                                {children}
                            </OptionGroup>
                        ):null
                    }
                </div>
            </SelectContext.Provider>
        )        
    }
}


