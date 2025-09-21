import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';

function SlideMenu({ menuConfig = [], onChangeRoute, hover }) {
    return menuConfig.map((firstItem, i) => {
        const subConfig = firstItem.menuConfig || [];
        return (
            <div className={firstItem.active ? 'menuTitle active' : 'menuTitle'} key={firstItem.fid}>
                <img className='menuIcon' src={firstItem.icon} />
                <span className='titleOther' style={{ display: hover ? 'inline-block' : 'none' }}>
                    <span className='name'>{firstItem.name}</span>
                    <span className='pullUpIcon'>&nbsp;</span>
                </span>

                <ul style={{ display: hover ? 'block' : 'none' }}>
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