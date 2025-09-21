/*eslint-disable*/
import React from 'react';
import { Tree, Input, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import loading from './img/loading.png';
import error from './img/error.png';
import worning from './img/tips_icon.png';
import execlIcon from './img/execl_icon.png';
import otherIcon from './img/other_icon.png';
import pdfIcon from './img/pdf_icon.png';
import pptIcon from './img/ppt_icon.png';
import txtIcon from './img/txt_icon.png';
import wordIcon from './img/word_icon.png';
import zipIcon from './img/zip_icon.png';
import cover1 from './img/cover1.png';
import cover2 from './img/cover2.png';
import cover3 from './img/cover3.png';
import cover4 from './img/cover4.png';
import form from './img/form.png';
import './index.css';

const { TreeNode } = Tree;

export default function DraggableTree (props) {
  const {
    treeData,
    getNewTreeData,
    handleClick,
    selectedId,
    getSelectedId,
    changeCheckedId,
    editId,
    getEditId,
    collapseIds,
    getCollapseIds,
    draggable,
    isEdit,
    platDataList,
    checkedKeys,
    isShowLabel=true
  } = props;
  const allFarentIds = platDataList.filter(item => item.children && item.children.length !== 0).map(item => item.id);
  //过滤出children数组中fileType不为空的所有id
  const allTreeNodes = platDataList.filter(item => item.children && item.children.length !== 0);
  let AllClickNodes = []; //可点击节点
  for ( const item of allTreeNodes) {
    if (item.fileType) {
      AllClickNodes.push(item.id);
    }
    for(const itx of item.children) {
      if (itx.fileType) {
        AllClickNodes.push(itx.id);
      }
    }
  }
  AllClickNodes = [...new Set(AllClickNodes)];
  const handleStatus = (info) => {
    return {
      1: {
        show: <span><img src={loading} className='icon loading' />{info.statusDes || ''}</span>
      },
      2: {
        show: <span><img src={loading} className='icon loading' />{info.statusDes || ''}</span>
      },
      3: {
        show: <span><img src={error} className='icon' />{info.statusDes || '上传失败'}</span>,
        oparate: <span className='oparate' onClick={() => handleClick && handleClick(info)}>重试</span>
      },
      4: {
        show: <span><img src={error} className='icon' />{info.statusDes || '解析失败'}</span>,
        oparate: <span className='oparate' onClick={() => handleClick && handleClick(info)}>重试</span>
      },
      6: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '单据重复'}</span>
          </Tooltip>
        )
      },
      7: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '业务单据不存在'}</span>
          </Tooltip>
        )
      },
      8: {
        show: <span><img src={error} className='icon' />{info.statusDes || '未识别出二维码'}</span>
      },
      9: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '以下影像存在异常'}</span>
          </Tooltip>
        )
      },
      10: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '单据已废弃'}</span>
          </Tooltip>
        )
      },
      11: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '单据已废弃'}</span>
          </Tooltip>
        )
      },
      12: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span className='warning'>{info.statusDes || '单据已废弃'}</span>
          </Tooltip>
        )
      },
      21: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span className='warning'><img src={worning} className='icon' />{info.statusDes || '发票重复'}</span>
          </Tooltip>
        )
      },
      22: {
        show: (
          <Tooltip title={info.fullStatusDes} open>
            <span><img src={error} className='icon' />{info.statusDes || '发票重复'}</span>
          </Tooltip>
        )
      }
    }
  };

  const onAddLabel = (item) => {
    if (props.onAddLabel && typeof props.onAddLabel === 'function') {
      props.onAddLabel(item.id);
    }
  };

  const editTile = (e, item) => {
    const { value } = e.target;
    if (!value) {
      return;
    }
    if (value === item.title) {
      getEditId('');
      return;
    }
    getNewTreeData && getNewTreeData(treeData.map(v => ({
      ...v,
      title: v.id === item.id ? value : v.title
    })), 'changeTitle');
  };

  const fileIcon = {
    'xls': execlIcon,
    'xlsx': execlIcon,
    'csv': execlIcon,
    'pdf': pdfIcon,
    'ppt': pptIcon,
    'pptx': pptIcon,
    'txt': txtIcon,
    'doc': wordIcon,
    'docx': wordIcon,
    'zip': zipIcon
  };

  const loop = (data, isChild) => {
    return data.map(item => {
      const _angle = Math.abs(item.angle);
      const isRotate = _angle === 90 || _angle === 270;
      return (
        <TreeNode
          key={item.id + ''}
          className={item.itemType !== 'coverNo' ? 'tree-child-item' : ''}
          title={(
            <>
              <div className='draggable-item' id={item.id + ''}>
                {item.itemType === 'file' && (
                  <>
                    <span style={{ display: 'inline-block', alignSelf: 'center', paddingRight: 10 }}>{item.index}</span>
                    <div className='draggable-item-left'>
                      <img
                        src={item?.compressUrl || item?.imgUrl || (fileIcon[item.extName] ? fileIcon[item.extName] : otherIcon)}
                        className='draggable-img'
                        style={{ transform: `rotate(${-item.angle || 0}deg)`, height: isRotate ? '100px' : '62px', width: isRotate ? '62px' : '100px' }}
                      />
                    </div>
                  </>
                )}
                <div className={item.itemType === 'file' ? 'draggable-item-right' : 'draggable-item-right draggable-item-title'}>
                  <div className='draggable-item-right-title'>
                    {item.id === editId ? (
                      <Input
                        defaultValue={item.title}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => editTile(e, item)}
                        className='draggable-input'
                        maxLength={50}
                        autoFocus
                      />
                    ) : (
                      <>
                        {item.fileType === 'cover' ? '' : (
                          <Tooltip title={item.title} open visible={false}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {[1, 2, 3, 4].includes(item.billStatus) && <img
                                src={item.billStatus === 1 ? cover1 : item.billStatus === 2 ? cover2 : item.billStatus === 3 ? cover3 : item.billStatus === 4 ? cover4 : ''}
                                className='cover-icon'
                              />}
                              {item?.iconList?.length > 0 ? (
                                  <div>
                                      {
                                          item.iconList.map((itx, idx) => (
                                              <img src={itx} key={idx} className='draggable-item-right-sign' />
                                          ))
                                      }
                                  </div>
                              ) : item?.attachTypeName ? (
                                  <div className='draggable-item-right-signName'>{item.attachTypeName.length > 4 ? `${item.attachTypeName.substring(0, 4)}...` : item.attachTypeName}</div>
                              ) : (
                                item.itemType === 'coverNo' ? (
                                  <Tooltip title={item.title}>
                                    <span>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                  </Tooltip>
                                ) : (
                                  <span>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                )
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </>
                    )}
                    {isEdit && item.itemType === 'coverNo' && item.id !== 'test01' && (
                      <img
                        src={form}
                        style={{ marginLeft: '10px', width: '14px', height: '14px' }}
                        onClick={() => {
                          getEditId(item.id);
                        }}
                      />
                    )}
                  </div>

                  {
                    item.itemType === 'file' && isShowLabel ? (
                      <div onClick={() => selectedId === item.id ? onAddLabel(item) : null}>
                        标签：<span style={{ color: selectedId === item.id ? '#3598ff' : 'rgba(0,0,0,.65)' }}>{item.labelNum || 0}</span>
                      </div>
                    ) :null
                  }
                  <div className='draggable-item-right-match'>{item.isMatch}</div>
                  <div className='draggable-item-right-status'>
                    {handleStatus(item)[item.status] ? handleStatus(item)[item.status].show : item.status && +item.status !== 5 ? (
                      <Tooltip title={item.fullStatusDes} open>
                        <span><img src={error} className='icon' />{item.statusDes || ''}</span>
                      </Tooltip>
                    ): ''}
                    {handleStatus(item)[item.status] ? handleStatus(item)[item.status].oparate : ''}
                  </div>
                </div>
              </div>
              {
                item.itemType === 'coverNo' && item.titleDes && (
                  <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap' }}>{item.titleDes}</div>
                )
              }
            </>
          )}
        >
          {item?.children && item.children.length > 0 && loop(item.children, true)}
        </TreeNode>
      )
    })
  };

  const onDrop = info => {
    const dropKey = info.node.props.eventKey; // 拖拽落下的值
    const dragKey = info.dragNode.props.eventKey; // 被拖拽的值
    const dropPos = info.node.props.pos.split('-'); // 拖拽落下的位置 最外层到最里层
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // console.log(info, dragKey, dropKey, dropPos, dropPosition, '------------------')
    // if (allFarentIds.includes(dragKey)) {
    //   return;
    // }

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.id + '' === key + '') {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...treeData];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    // 只允许二级内的拖动
    if (!info.dropToGap && dropPos.length < 3 && !info.dragNode.props?.children?.length) {
      // Drop on the content
      console.log(1, '拖动到子级')
      loop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.push(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      console.log(2)
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      console.log(3, '拖动到上级')
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    getNewTreeData && getNewTreeData(data, 'changeOrder');
  };

  const onDragEnter = () => {};
  return (
    <div className='draggable-tree'>
      <Tree
        checkable
        draggable={draggable}
        blockNode
        // showLine
        // switcherIcon={<img src={arrow} className='draggable-arrow' />}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        className='hide-file-icon'
        selectedKeys={[selectedId + '']}
        checkedKeys={checkedKeys.filter(item => platDataList.some(i => i.id === item))}
        expandedKeys={allFarentIds.filter(item => !collapseIds.includes(item))}
        onSelect={(selectedKeys, e) => {
          if (!AllClickNodes.includes(selectedKeys[0])) {
            return;
          }
          getSelectedId && getSelectedId(selectedKeys[0]);
        }}
        onCheck={(keys, e) => {
          changeCheckedId && changeCheckedId(keys);
        }}
        onExpand={(expandedKeys) => {
          const id = allFarentIds.filter(item => !expandedKeys.includes(item));
          getCollapseIds(id)
        }}
      >
        {loop(treeData, false)}
      </Tree>
    </div>
  );
}

DraggableTree.propTypes = {
  treeData: PropTypes.array, // 数据源
  getNewTreeData: PropTypes.func, // 回调函数，改变treeData
  handleClick: PropTypes.func, // 状态触发事件
  selectedId: PropTypes.string, // 当前选中值的id
  getSelectedId: PropTypes.func, // 获取选中的值的id
  changeCheckedId: PropTypes.func, // 获取勾选上的ids
  editId: PropTypes.string, // 点击编辑时的id
  getEditId: PropTypes.func, // 获取编辑时的id
  collapseIds: PropTypes.array, // 默认展开的id
  getCollapseIds: PropTypes.func,
  draggable: PropTypes.bool, // 是否可以拖动
  isEdit: PropTypes.bool,
  platDataList: PropTypes.array,
  isShowLabel: PropTypes.bool
};

DraggableTree.defaultProps = {
  treeData: []
};