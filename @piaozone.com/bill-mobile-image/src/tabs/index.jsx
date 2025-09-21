import React from 'react';
import PropTypes from 'prop-types';
import './tabs.less';

function Tabs({ tabIndex, onChange, tabList }) {
    const tabs = tabList || [
        { value: '封面', name: 'cover' },
        { value: '纸票/附件', name: 'paperInvoice' },
        { value: '电票', name: 'elecInvoice' }
    ];
    return (
        <div className='mobileImageTabs'>
            {
                tabs.map((item, i) => {
                    return (
                        <a
                            href='javascript:;'
                            key={item.name}
                            className={tabIndex === i ? 'active tabItem' : 'tabItem'}
                            onClick={() => onChange(i)}
                        >
                            {item.value}
                        </a>
                    );
                })
            }
        </div>
    );
}


Tabs.propTypes = {
    onChange: PropTypes.func.isRequired,
    tabIndex: PropTypes.number.isRequired,
    tabList: PropTypes.array
};

export default Tabs;