import React from 'react';
import PropTypes from 'prop-types';

import style from './index.less';

const propTypes = {
    systems: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        img: PropTypes.string,
        modules: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string,
            desc: PropTypes.string
        }))
    })).isRequired,
    handleModuleClick: PropTypes.func.isRequired,
};

function Applications(props) {
    const { systems, handleModuleClick, ...restProps } = props;
    return (
        <div className={style.apps} {...restProps}>
            {
                systems.map(system => {
                    const { modules, name, img, key } = system;
                    return (
                        <div className={style.system} key={name}>
                            <div className={style.header}>
                                <img className={style.img} src={img} alt={name} />
                                <div className={style.name}>{name}</div>
                            </div>
                            
                            <div className={style['module-container']}>
                                {
                                    modules.map((module, index) => {
                                        const { icon, title, desc } = module;
                                        return (
                                            <div className={style.module} key={title} onClick={() => handleModuleClick(key, module, index)}>
                                                <img className={style.icon} src={icon} alt={title} />
                                                <div className={style.content}>
                                                    <h1 className={style.title}>{title}</h1>
                                                    <p className={style.desc}>{desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    );
                })
            }
           
        </div>
    );
}

Applications.propTypes = propTypes;

export default Applications;