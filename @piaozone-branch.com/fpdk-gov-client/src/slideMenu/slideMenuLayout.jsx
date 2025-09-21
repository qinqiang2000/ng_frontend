import React from 'react';
import './style.less';
import PropTypes from 'prop-types';
import Menu from './menu';
import { connect } from 'dva';

function SlideMenuLayout(props) {
    const { headerHeight = 0, footerHeight = 0, menuMinWidth = 60, fullHeight = '100vh', menuConfig, hoverMenu, dispatch } = props;
    
    const offsetSize = headerHeight + footerHeight;
    return (
        <div className='menuLayout' style={{ height: fullHeight, paddingTop: offsetSize, marginTop: -offsetSize }}>
            <div className='innerLayout'>
                <div
                    className={hoverMenu ? 'menuLeft hover' : 'menuLeft'} 
                    style={{ width: menuMinWidth }} 
                    onMouseOver={() => dispatch({ type: 'menuLayout/changeMenuHover', payload: { hoverMenu: true } })}
                    onMouseLeave={() => dispatch({ type: 'menuLayout/changeMenuHover', payload: { hoverMenu: false } })}
                >
                    <Menu 
                        menuConfig={menuConfig}
                        hover={hoverMenu} 
                        onChangeRoute={(index, sIndex) => dispatch({ type: 'menuLayout/changeRoute', payload: { pIndex: index, subIndex: sIndex } })}
                    />
                </div>
                <div className='content' style={{ left: menuMinWidth }}>
                    {props.children}
                </div>
            </div>
        </div>
    );
};

SlideMenuLayout.propTypes = {
    headerHeight: PropTypes.number,
    footerHeight: PropTypes.number,
    menuMinWidth: PropTypes.number,
    fullHeight: PropTypes.number,
    menuConfig: PropTypes.array,
    children: PropTypes.object,
    hoverMenu: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    const { hoverMenu, menuConfig } = state.menuLayout;
    return {
        hoverMenu,
        menuConfig
    };
}

export default connect(mapStateToProps)(SlideMenuLayout);