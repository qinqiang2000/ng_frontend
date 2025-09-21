import React from 'react';
import PropTypes from 'prop-types';
import './noneAddedBillForm.css';
import Immutable from 'immutable';

class BaseBill extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        this.initBillData = Immutable.fromJS(billData);
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
            const notModify = Immutable.is(Immutable.fromJS({ ...this.state.billData, invoiceType: this.props.invoiceType }), this.initBillData);
            if (!notModify) {
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

BaseBill.propTypes = {
    billData: PropTypes.object.isRequired,
    clientHeight: PropTypes.number.isRequired,
    invoiceType: PropTypes.number.isRequired
};

export default BaseBill;