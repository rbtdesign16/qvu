import React from "react";
import PropTypes from "prop-types";

const DataEntryPanel = (props) => {
  const {panelConfig, data, key} = props;
 
  return (
    <div key={key} className="data-entry-panel">
    </div>
  );
};

DataEntryPanel.propTypes = {
    panelConfig: PropTypes.object.isRequired,
    data: PropTypes.string.isRequired,
    data: PropTypes.object
};

DataEntryPanel.defaultProps = {
  data: {}
};

export default DataEntryPanel;
