import React from 'react';
import { connect } from 'dva';
import {Radio, Modal,  } from 'antd';
import '../media/css/caCheckDialog.css';

class SbztDialog extends React.Component{
    constructor(props){
        super(...arguments);
        this.confirmSbzt = this.confirmSbzt.bind(this);
        this._isMounted = false;
        this.state = {
        	showDialog: props.visible,   
        	skssq: props.skssq || '',
        	confirming: false,
        	sbzt: '',
        }
   	}
    
    componentDidMount(){
    	this._isMounted = true;
	}
	
    componentWillReceiveProps(nextProps){
    	if(this._isMounted){
    		this.setState({
				skssq: nextProps.skssq
			})
    	}
	}
    
    componentWillUnmount(){
    	this._isMounted = false;
    }
    
    confirmSbzt(){        	
    	this.props.onConfirm({sbzt: this.state.sbzt});
    }
	
	onCancel = ()=>{
		typeof this.props.onCancel === 'function' && this.props.onCancel();
	}

    render(){
		const {showDialog, sbzt, skssq} = this.state;
		const visible = this.props.visible;

    	if(skssq !==''){
    		const curSkssq = skssq[0].substr(0,4) + '年' + skssq[0].substr(4,2)+'月';
	    	const nextSkssq = skssq[2].substr(0,4) + '年' + skssq[2].substr(4,2)+'月';
	    	return (
	    		
	    		<Modal
		       		visible={visible}
	      			title='选择申报状态'
	      			className="authDialog"
	      			onOk={this.confirmSbzt}
          			onCancel={this.onCancel}
	      		>
		       		<div style={{marginBottom: 15, fontWeight: 'bold'}}>尊敬的纳税人：因获取您税款所属期{curSkssq}的申报结果信息有延迟，请您选择是否已完成税款所属期{curSkssq}的增值税申报工作!</div>
			       	<div style={{marginBottom: 10}}>
			       		<Radio checked={sbzt === '1'} onClick={()=>this.setState({sbzt: '1'})} style={{color:'red'}}>未完成申报</Radio>
			       		<p>可以继续进行税款所属期{curSkssq}的确认勾选！</p>
			       	</div>
			       	<div style={{marginBottom: 10}}>
			       		<Radio checked={sbzt === '2'} onClick={()=>this.setState({sbzt: '2'})} style={{color:'red'}}>已申报</Radio>
			       		<p>系统将回退您税款所属期{curSkssq}已勾选未确认的发票，并把您的税款所属期切换到{nextSkssq},您可以进行税款所属期{nextSkssq}的发票确认勾选！</p>
			       	</div>
			       	
			       	<div>
			       		<Radio checked={sbzt === '3'} onClick={()=>this.setState({sbzt: '3'})} style={{color:'red'}}>不确定</Radio>
			       		<p>您需要先去确定您税款所属期{curSkssq}的增值税申报工作是否已完成！</p>
			       	</div>
		       	
		       </Modal>
				
	    	)
    	}else{
    		return null;
    	}
    	
    }
}

export default connect()(SbztDialog);