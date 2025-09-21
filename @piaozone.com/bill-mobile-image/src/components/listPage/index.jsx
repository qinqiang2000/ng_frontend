import React from 'react';
import ListRow from '../listRow/index';
import LoadFail from '../../loadFail';
import PropTypes from 'prop-types';
import './style.less';
export default function ListPage({ list, name, rejectState, onDetailClick }) {
    const disableScroll = false;
    let itemData = [];
    if (list.length > 0) {
        for (const item of list) {
            itemData = itemData.concat(item);
        }
    }
    const { clientHeight } = document.body;
    let style = '';
    if (rejectState) {
        style = {
            width: '100%',
            height: clientHeight - 110 + 'px'
        };
    } else {
        style = {
            width: '100%',
            height: clientHeight - 60 + 'px'
        };
    }

    return (
        <div className='ExpenseList' style={{ position: 'relative' }}>
            <div
                className={disableScroll ? 'listWrap' : 'listWrap scroll'}
                style={style}
            >
                <div className='listWraps'>
                    <div className=''>
                        {
                            itemData.length > 0 ? (
                                <ul className='bxfp'>
                                    {
                                        itemData.map((item, i) => {
                                            return (
                                                <ListRow
                                                    key={i}
                                                    serialNo={item.serialNo}
                                                    data={item}
                                                    name={name}
                                                    index={i}
                                                    onDetailClick={onDetailClick}
                                                />
                                            );
                                        })
                                    }
                                </ul>
                            ) : <LoadFail />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

ListPage.propTypes = {
    list: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    onDetailClick: PropTypes.func.isRequired,
    rejectState: PropTypes.bool.isRequired
};