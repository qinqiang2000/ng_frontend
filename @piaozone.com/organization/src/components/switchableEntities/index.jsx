import React from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import './index.css';
import PropTypes from 'prop-types';
const Search = Input.Search;

function SwitchableEntities(props) {
    const {
        entityList,
        style = {},
        visible,
        currentOrgId,
        onSelectEntity,
        onSearchEntity,
        searchValue
    } = props;

    let timmer = null;

    function getClassName(entityOuNo) {
        return currentOrgId === entityOuNo ? 'entity current' : 'entity';
    }

    function searchEntity(param) {
        clearTimeout(timmer);
        timmer = setTimeout(() => {
            onSearchEntity(param);
        }, 300);
    }

    return (
        visible ? (
            <div
                className='SwitchableEntitiesPanel'
                style={style}
            >
                <div className='searchContainer'>
                    <Search 
                        className='searchInput'
                        placeholder='输入组织名称搜索'
                        onSearch={(param) => searchEntity(param.trim())}
                        onChange={({ target: { value: param } }) => searchEntity(param.trim())}
                    />
                </div>
                <div className='main'>
                    {entityList
                        .filter(entity => {
                            if (searchValue !== '') {
                                return entity.entityOuName.indexOf(searchValue) > -1;
                            } else {
                                return true;
                            }
                        })
                        .map(entity => (
                            <div
                                className={getClassName(entity.entityOuNo)}
                                key={entity.entityOuNo}
                                onClick={() => onSelectEntity(entity)}
                                title={entity.entityOuName}
                            >
                                {entity.entityOuName}
                            </div>
                        ))}
                </div>
            </div>
        ) : null

    );
}

SwitchableEntities.propTypes = {
    entityList: PropTypes.array,
    stye: PropTypes.object,
    visible: PropTypes.bool,
    currentOrgId: PropTypes.string,
    onSelectEntity: PropTypes.func,
    searchValue: PropTypes.string
};

function mapStateToProps(state) {
    const { currentOrgId } = state.login;
    const { entityList } = state.org;
    return {
        currentOrgId,
        entityList
    };
}

export default connect(mapStateToProps)(SwitchableEntities);


