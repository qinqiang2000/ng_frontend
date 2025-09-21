import React from 'react';
import ListPage from '../components/listPage/index';
import { groupList } from '../utils/tools';
import PropTypes from 'prop-types';

export default function Electron({ electronicInvoice, ...props }) {
    const eleList = groupList(electronicInvoice);
    return (
        <div className='eleContent'>
            <ListPage
                list={eleList}
                name='eleList'
                onDetailClick={props.onDetailClick}
                rejectState={props.rejectState}
                onCheckPdf={props.onCheckPdf}
            />
        </div>
    );
}

Electron.propTypes = {
    electronicInvoice: PropTypes.array,
    onDetailClick: PropTypes.func,
    onCheckPdf: PropTypes.func,
    rejectState: PropTypes.bool
};