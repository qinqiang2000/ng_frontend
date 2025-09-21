import React from 'react';

import './turnPage.css';
import {Input} from '../Form';

const filterNumber = (v) => {
    return parseInt(v.replace(/[^0-9]/, '').replace(/^0/, ''));
}

class TurnPage extends React.Component{
    constructor(){
        super(...arguments);
        const curPage = this.props.curPage || 1;
        this.state = {            
            curPage,
            tempPage: curPage,
            totalPage: this.props.totalPage || 10
        }
    }
    
    componentWillReceiveProps(nextProps){
        if(nextProps.curPage !== this.state.curPage || nextProps.totalPage !== this.state.totalPage){
            this.setState({
                curPage: nextProps.curPage,
                tempPage: nextProps.curPage,
                totalPage: nextProps.totalPage
            })
        }
    }
    
    render(){
        const {totalPage, curPage, tempPage} = this.state;
        const turnTo = this.props.turnTo;
        const maxNum = this.props.maxNum || 6;
        let className = this.props.className;
        
        let showPages = [];
        
        if(className !== 'turnPage'){
            className = className + ' turnPage';
        }
        
        if(totalPage<=maxNum){
            for(let i=1; i<=totalPage; i++){
                showPages.push(i);
            }
        }else{
            for(let i=curPage; i<=curPage+maxNum-1 && i<=totalPage; i++){
                showPages.push(i);
            }
            
            const leftNum = maxNum - showPages.length;            
            for(let j=0; j<leftNum;j++){
                showPages.unshift(curPage-j-1);
            }
        }
        
        
        if(totalPage>1){
            return (
                <div className="outTurnPage">
                    <div className={className}>
                        <a 
                            className="preIcon" 
                            onClick={()=>{
                                    if(curPage>1){
                                        turnTo(curPage - 1);
                                    }
                                }
                            }
                        >
                        </a>
                        <div className="pageItems">
                        {
                            //点击页值
                            showPages.map((p) => {
                                return (
                                    <a href="javascript:;" 
                                        className={p === curPage?"active pageItem":"pageItem"} 
                                        key={p} 
                                        onClick={()=>{
                                               turnTo(p);
                                            }
                                        }
                                    >
                                        {p}
                                    </a>
                                )
                            })
                        }
                        </div>
                        <a 
                            className="nextIcon" 
                            onClick={()=>{
                                    if(curPage < totalPage){                                    
                                        turnTo(curPage + 1);   
                                    }
                                }
                            }
                        >
                        </a>
                        <div className="inputPage">
                            <span>跳至</span>
                            <Input 
                                value={tempPage}
                                onChange={(e)=>{this.setState({tempPage: filterNumber(e.target.value)})}} 
                                onKeyUp={(e)=>{
                                    if(e.keyCode === 13){
                                        const v = filterNumber(e.target.value);
                                        if(v <= totalPage && v>0){                                    
                                            turnTo(v);   
                                        }
                                    }
                                }}
                                onBlur={(e)=>{
                                        const v = filterNumber(e.target.value);
                                        if(v <= totalPage && v>0){
                                            if(v !== curPage){
                                                turnTo(v);   
                                            }
                                        }else{
                                            this.setState({
                                                tempPage: curPage
                                            })
                                        }
                                    }
                                }
                            />/
                            <span className="totalPage">{totalPage}</span>
                        </div>
                    </div>
                </div>
            )
        }else{
            return null;
        }
    }
}

export default TurnPage;