import React from 'react';
import PropTypes from 'prop-types';

import style from './index.less';

const propTypes = {
    children: PropTypes.node.isRequired
};

function Content(props) {
    const { children, ...restProps } = props;
    return (
        <div className={style.content} {...restProps}>
            {children}
        </div>
    );
}

Content.propTypes = propTypes;

export default Content;