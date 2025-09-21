import React from 'react';

export default function createTableCols(cols = []) {
    const newCols = [];
    let totalWidth = 0;
    for (let i = 0; i < cols.length; i++) {
        if (!cols[i].fixed && cols[i].display !== false) {
            totalWidth += (cols[i].width || cols[i].autoWidth);
        }
    }

    for (let i = 0; i < cols.length; i++) {
        const {
            autoWidth,
            type = 'string',
            display,
            ...otherColItem
        } = cols[i];
        if (display === false) {
            continue;
        }
        const newCol = {
            valign: 'top',
            ...otherColItem
        };

        if (typeof otherColItem.dataIndex === 'undefined') {
            newCol.dataIndex = otherColItem.key; // key必须传
        }

        if (typeof otherColItem.render === 'undefined') {
            newCol.render = (v, r) => {
                let cls = '';
                if (type === 'string' && (typeof v === 'object' || typeof v === 'undefined' || v === '')) {
                    v = '--';
                } else if (type === 'number' || typeof v === 'object') {
                    if (typeof v === 'object' || v === '') {
                        v = '';
                    } else {
                        v = parseFloat(v).toFixed(2);
                        cls = 'number';
                    }
                }
                return (
                    <span style={{ display: 'inline-block', wordBreak: 'break-all' }} className={cls}>{v}</span>
                );
            };
        }
        newCols.push(newCol);
    }

    return {
        cols: newCols,
        scroll: {
            x: totalWidth
        }
    };
}