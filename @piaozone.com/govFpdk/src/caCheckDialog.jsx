import React from 'react';
import { connect } from 'dva';
import {Checkbox, Button, Modal, Input, message, LocaleProvider } from 'antd';
import Label from '@piaozone.com/label';
import '../media/css/caCheckDialog.css';

class CacheckDialog extends React.Component{
    constructor(props){
        super(...arguments);
        this.taxDiskAuth = this.taxDiskAuth.bind(this);
        
        this.state = {
        	showDialog: props.visible,        	
        	confirming: false,
        	caPasswd: '', 
        	ptPasswd: ''
        }
   	}
    
    componentWillReceiveProps(nextProps){
    	
	}
    
    taxDiskAuth(){
    	const {caPasswd, ptPasswd} = this.state;
    	if(caPasswd.length < 6 ){
            message.info('请先输入正确的CA密码');
            return false;
        }
        
    	this.props.onConfirm({caPasswd, ptPasswd});
	}
	
    onCancel = ()=>{
		typeof this.props.onCancel === 'function' && this.props.onCancel();
	}

    render(){
		const {showDialog, confirming, caPasswd, ptPasswd} = this.state;
		const visible = this.props.visible;

    	return (
    		
    		<Modal
            	visible={visible}
          		title={this.props.title || '税控企业认证'}
          		className="authDialog"
          		confirmLoading={this.state.confirming}
          		onOk={this.taxDiskAuth}
          		onCancel={this.onCancel}
            >
				<div className="caCheckDialog">
					<div className="centerRow" style={{margin: '30px 0 30px 0', textAlign:'center'}}>
				        <Label>税盘CA密码:</Label>
				        <Input 
				        	autoFocus={true} 
				        	type="password" 
				        	value={caPasswd} 
				        	placeholder="请输入税控CA密码" 
				        	onChange={(e)=>this.setState({caPasswd: e.target.value})}
				        	onPressEnter={this.taxDiskAuth}
				        />
				    </div>
				    <div className="centerRow" style={{margin: '0 0 20px 0', textAlign:'center'}}>
				        <Label>勾选平台密码:</Label>
				        <Input 
				        	type="password" 
				        	value={ptPasswd} 
				        	placeholder="如果没有设置平台密码可为空" 
				        	onChange={(e) => this.setState({ptPasswd: e.target.value})}
				        	onPressEnter={this.taxDiskAuth}
				        />
				    </div>
				    <div className="row" style={{textAlign: 'center', fontSize: '12px', color:'#ffac38'}}>
				        <p className="tip">请先下载企业认证组件, 并确定启动认证服务! <a className="download" href={window.staticUrl + '/download/company_auth.rar'} style={{marginLeft: '10px'}}>认证组件下载</a></p>
				    </div>
				</div>
			</Modal>
			
    	)
    }
}

export default connect()(CacheckDialog);