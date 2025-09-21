import React from 'react';
import './noneAddedBillForm.css';

export default class BaseBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.state = {
            billData: billData,
            saving: false,
            scrollHeight: 0
        };
    }

    componentDidMount() {
        this._isAmounted = true;
        this.setState({
            scrollHeight: this.props.clientHeight - this.refs.inputItems.offsetHeight - 10
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this._isAmounted) {
            if (!window._.isEqual({ ...this.state.billData, invoiceType: this.props.invoiceType }, nextProps.billData)) {
                this.setState({
                    billData: nextProps.billData,
                    saving: false
                });
            } else if (this.state.saving) {
                this.setState({
                    saving: false
                });
            }
        }
    }
}