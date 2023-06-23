import React from "react";
import PropTypes from "prop-types";

const ObjectArrayPanel = (props) => {
    const {data, title, height, width} = props;

    const loadData = () => {
        return data.map(o => {
            return "";
        });
    }

    return (
            <div style={{width: width, height: height}} className="object-array-panel">
                <div className="title">{title}</div>
                <div className="data-container">
                    { loadData() }
                </div>    
            </div>
            );
};

ObjectArrayPanel.propTypes = {
    data: PropTypes.object,
    height: PropTypes.string,
    width: PropTypes.string,
    title: PropTypes.string.isRequired
};

ObjectArrayPanel.defaultProps = {
    data: [],
    height: "100%",
    width: "100%"
};

export default ObjectArrayPanel;
