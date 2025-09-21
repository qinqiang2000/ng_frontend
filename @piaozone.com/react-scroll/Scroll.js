import React from 'react';

import '/scroll.css';

class Scroll extends React.Component {
    constructor(){
        super(...arguments);
        this.onMoveHBarStart = this.onMoveHBarStart.bind(this);
        this.onMoveHBarMove = this.onMoveHBarMove.bind(this);
        this.onMoveHBarEnd = this.onMoveHBarEnd.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.scrollId = +new Date();
        this.HbarMoveStart = 0;
        this.moveing = false;        
        this.minTop = 0; 
        this.maxTop = 0;
        this.hBarMinTop = 0;
        this.hBarMaxTop = 0;
        this.alwaysShowHBar = this.props.showHBar || false;
        this.hbarMoveStartTop = 0;
        this.state = {            
            fullHeight: 0,
            barHeight: 0,
            top: 0,
            hBarTop:0,
            mouseOver: false,
            showHBar: false
        }
    }
    
    componentDidMount(){
        this.freshHeight();
        document.body.addEventListener('mouseup', this.onMoveHBarEnd);
        document.body.addEventListener('mousemove', this.onMoveHBarMove);
    }
    
    componentWillUnmount(){
        document.body.removeEventListener('mouseup', this.onMoveHBarEnd);
        document.body.removeEventListener('mousemove', this.onMoveHBarMove); 
    }
    
    componentDidUpdate(){
        this.freshHeight();
    }
    
    freshHeight(){
        const fullHeight = document.getElementById(this.scrollId).clientHeight;
        
        const height = this.props.height;
        let showHBar = false;
        let barHeight = 0;
        const rt = parseFloat(fullHeight/height);
        
        if(fullHeight > height){           
            barHeight = parseFloat(height/rt);
            showHBar = true;
            this.minTop = height - fullHeight; 
            this.maxTop = 0;
            this.hBarMinTop = 0;
            this.hBarMaxTop = height - barHeight;
        }
        
        if(this.state.fullHeight !== fullHeight || this.state.barHeight !== barHeight || this.state.showHBar !== showHBar){
            this.setState({            
                fullHeight,
                barHeight,
                showHBar
            });    
        }
        
    }
    
    onMouseOver(){
        this.setState({
            mouseOver: true
        })
    }
    
    onMouseLeave(){
        this.setState({
            mouseOver: false
        })
    }
    
    onMoveHBarStart(e){
        this.hbarMoveStartTop = this.state.hBarTop;
        this.pageLastTop = this.state.top; 
        this.HbarMoveStart = e.pageY;
        this.moveing = true;
        e.preventDefault();
        return false;
    }
    
    changeLocation(delta, type='move'){
        const curTop = this.state.top;
        const curHBarTop = this.state.hBarTop;
        const rt = parseFloat((this.maxTop - this.minTop)/(this.hBarMaxTop - this.hBarMinTop));
        
        let newTop = this.pageLastTop - delta * rt;
        let newHBarTop = this.hbarMoveStartTop + delta;
        if(type === 'wheel'){
            newTop = curTop - delta * rt;
            newHBarTop = curHBarTop + delta;
        }
        
        if(newTop<this.minTop){
            newTop = this.minTop;
        }
        if(newTop>this.maxTop){
            newTop = this.maxTop;
        }
        
        
        if(newHBarTop > this.hBarMaxTop){
            newHBarTop = this.hBarMaxTop;
        }
        
        if(newHBarTop < this.hBarMinTop){
            newHBarTop = this.hBarMinTop;
        }
        
        this.setState({
            top:  newTop,
            hBarTop: newHBarTop
        });
    }
    
    onMoveHBarMove(e){
        if(this.moveing){
            this.changeLocation(e.pageY - this.HbarMoveStart);            
            e.preventDefault();
            return false;
        }        
    }
    
    onMoveHBarEnd(e){
        this.moveing = false;
        this.hbarMoveStartTop = this.state.hBarTop;
        this.pageLastTop = this.state.top;
    }
    
    onMouseWheel(e){
        this.changeLocation(e.deltaY*10, 'wheel');
        this.hbarMoveStartTop = this.state.hBarTop;
        this.pageLastTop = this.state.top;
        e.preventDefault();
        return false;
    }
    
    
    render(){
        const {content} = this.props;
        let height = this.props.height;
        const style = this.props.style || '';
        const {top, barHeight, showHBar, mouseOver, hBarTop} = this.state;
        
        
        return (            
            <div className="rScroll" style={showHBar?{'height': height + 'px'}:{'maxHeight': height + 'px'}} onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} onWheel={this.onMouseWheel}>
                <div className="rScrollBox" style={{transform: 'translate(0, '+ top +'px)'}} id={this.scrollId}>
                    {content}
                </div>
                {
                  (mouseOver && showHBar ) || this.alwaysShowHBar?(
                       <div 
                            className="hScroll"
                            onMouseDown={this.onMoveHBarStart}                                                          
                            style={{height: barHeight+'px',transform: 'translate(0, '+ hBarTop +'px)'}}>                                                       
                       </div>
                  ):null
                }
                
            </div>
        )
    }
}

export default Scroll;
