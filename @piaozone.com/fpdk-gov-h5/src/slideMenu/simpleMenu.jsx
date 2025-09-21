import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';

function SlideMenu({ menuConfig = [], onChangeRoute, hover }) {
    return menuConfig.map((firstItem, i) => {
        const subConfig = firstItem.menuConfig || [];
        return (
            <div className={firstItem.active ? 'menuTitle active' : 'menuTitle'} key={firstItem.fid}>
                <span className='titleOther'>
                    <span className='name'>{firstItem.name}</span>
                </span>
                <ul>
                    {
                        subConfig.map((secondItem, j) => {
                            const activeName = secondItem.active ? 'active' : '';
                            return (
                                <li key={secondItem.fid}>
                                    <Link to={secondItem.path} className={activeName} onClick={() => onChangeRoute(i, j)}>
                                        {secondItem.name}
                                    </Link>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    });
}

SlideMenu.propTypes = {
    menuConfig: PropTypes.array
};

export default SlideMenu;