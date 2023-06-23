import React from "react";
import { CgAdd }
from 'react-icons/cg';
import PropTypes from "prop-types";

const EditableDataList = (props) => {
    const {listConfig} = props;
    const loadPanels = () => {
        return listConfig.data.map(p => {
            return <div></div>;
        });
    }

    return (
            <div style={{width: listConfig.width, height: listConfig.height}} className="editable-data-list">
                <div  className="title">
                    <span>{listConfig.title}</span>
                    {listConfig.canAdd && 
                        <span style={{float: "right"}}><CgAdd title={listConfig.addTitle} className="icon green" onClick={listConfig.onAdd}/></span>
                    }
                </div>
                <div className="data-container">
                    { loadPanels() }
                </div>    
            </div>
            );
};
EditableDataList.propTypes = {
    listConfig: PropTypes.object.isRequired,
};
export default EditableDataList;
