import React from 'react';
import './simplteStyle.less';
import PropTypes from 'prop-types';
import SimpleMenu from './simpleMenu';
import { connect } from 'dva';

function SlideMenuLayout(props) {
    const { headerHeight = 0, footerHeight = 0, menuMinWidth = 110, fullHeight = '100vh', menuConfig, hoverMenu, dispatch } = props;

    const offsetSize = headerHeight + footerHeight;
    return (
        <div className='simpleSlideMenuLayout' style={{ height: fullHeight, paddingTop: offsetSize, marginTop: -offsetSize }}>
            <div className='innerLayout'>
                <div className='menuLeft' style={{ width: menuMinWidth }}>
                    <SimpleMenu
                        menuConfig={menuConfig}
                        hover={hoverMenu}
                        onChangeRoute={(index, sIndex) => dispatch({ type: 'menuLayout/changeRoute', payload: { pIndex: index, subIndex: sIndex } })}
                    />
                </div>
                <div className='content' style={{ left: menuMinWidth + 10 }}>
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