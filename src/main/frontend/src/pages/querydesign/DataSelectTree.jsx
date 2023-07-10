import React, { useState, useEffect } from "react";
import TreeView, { flattenTree } from "react-accessible-treeview";
import PropTypes from "prop-types";
import {
NODE_TYPE_ROOT,
        NODE_TYPE_TABLE,
        NODE_TYPE_COLUMN,
        NODE_TYPE_IMPORTED_FOREIGNKEY,
        NODE_TYPE_EXPORTED_FOREIGNKEY } from "../../utils/helper";

const DataSelectTree = (props) => {
    const {data} = props;
    const getIcon = (nodeType) => {
        switch (nodeType) {
            case NODE_TYPE_ROOT:
                return "";
            case NODE_TYPE_TABLE:
                return "";
            case NODE_TYPE_COLUMN:
                return "";
            case NODE_TYPE_IMPORTED_FOREIGNKEY:
                return "";
            case NODE_TYPE_EXPORTED_FOREIGNKEY:
                return "";
        }
    };

    const nodeRenderer = (p) => {
        const {element, isExpanded, level, getNodeProps} = p;
        return (<div {...getNodeProps()} style={{paddingLeft: 20 * (level - 1)}}>
            {getIcon(element.nodeType)}{element.name}
        </div>);

    };

    if (data) {
        return (<div className="datasel-tree-cont">

            <TreeView
                data={data}
                aria-label="query-select-tree"
                nodeRenderer={nodeRenderer}
                /></div>
                );
    } else {
        return <div className="datasel-tree-cont"></div>;
    }
};

DataSelectTree.propTypes = {
    data: PropTypes.object
};

export default DataSelectTree;