import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';

function Layout(props) {    
    return (
        <div className='Layout'>
            {props.children}
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.object
};

export default connect()(Layout);