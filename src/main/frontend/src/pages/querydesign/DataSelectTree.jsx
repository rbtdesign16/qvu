import React, { useState, useEffect } from "react";
import TreeView from "react-accessible-treeview";
import {FcTimeline, FcKey} from "react-icons/fc";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../..//context/LangContext";
import JoinType from "./JoinType";
import TreeArrowIcon from "../../widgets/TreeArrowIcon"
import TreeCheckboxIcon from "../../widgets/TreeCheckboxIcon"
import PropTypes from "prop-types";

import {
    NODE_TYPE_ROOT,
    NODE_TYPE_TABLE,
    NODE_TYPE_COLUMN,
    NODE_TYPE_IMPORTED_FOREIGNKEY,
    NODE_TYPE_EXPORTED_FOREIGNKEY,
    SMALL_ICON_SIZE} from "../../utils/helper";

const DataSelectTree = (props) => {
    const {getText} = useLang();
    const {
        treeViewData,
        selectedColumnIds,
        selectedTableIds,
        baseTable,
        selectColumns,
        setSelectColumns,
        setSelectedColumnIds,
        setSelectedTableIds,
        setBaseTable,
        fromClause,
        filterColumns, 
        setFilterColumns,
        setFromClause,
        treeViewExpandedIds,
        updateSelectColumns} = useQueryDesign();
    const [showJoinType, setShowJoinType] = useState({show: false});
    
    const getFkIcon = (element, type) => {
        if (selectedTableIds.includes(element.id)) {
            if (element.metadata.jointype === "inner") {
               return "table_" + type + "_inn_sel.png";
           } else {
               return "table_" + type + "_sel.png"; 
           }
       } else {
           if (element.metadata.jointype === "inner") {
               return "table_" + type + "_inn.png";
           } else {
               return "table_" + type + ".png";
           }
        }
    };
    
     const getIcon = (element) => {
        if (element.metadata && element.metadata.type) {
            switch (String(element.metadata.type)) {
                case NODE_TYPE_ROOT:
                    return <FcDatabase className="icon" size={SMALL_ICON_SIZE}/>;
                case NODE_TYPE_TABLE:
                    if (selectedTableIds.includes(element.id)) {
                        return <img src="table_sel.png" width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} />;
                    } else {
                        return <img  src="table.png" width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} />;
                    }
                case NODE_TYPE_COLUMN:
                    if (element.metadata.pkindex > -1) {
                        return <FcKey className="icon" size={SMALL_ICON_SIZE}/>;
                    } else {
                        return <FcTimeline className="icon" size={SMALL_ICON_SIZE}/>;
                    }
                case NODE_TYPE_IMPORTED_FOREIGNKEY:
                    return <img src={getFkIcon(element, "imp")} width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} />;
                 case NODE_TYPE_EXPORTED_FOREIGNKEY:
                    return <img src={getFkIcon(element, "exp")} width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} />;

            }
        } else {
            return "";
        }
    };

    const onClick = (e, element, handleSelect, isSelected) => {
        // if currently unselected we are selecting
        if (!isSelected) {
            if (element.metadata && element.metadata.roottable) {
                if (!baseTable) {
                    setBaseTable(element.metadata.roottable);
                }

                if (baseTable !== element.metadata.roottable) {
                    clearJoinSettings(selectedColumnIds);
                    setSelectedNodeIds([element.id]);
                    setBaseTable(element.metadata.roottable);
                } else {
                    let sids = [...selectedColumnIds];
                    sids.push(element.id);
                    setSelectedNodeIds(sids);
                }

            }
        } else { // unselect - remove id
            let sids = [...selectedColumnIds];
            let indx = sids.indexOf(element.id);
            if (indx > -1) {
                sids.splice(indx, 1);
                setSelectedNodeIds(sids);
            }
        }

        handleSelect(e);
        e.stopPropagation();
    };

    const setSelectedNodeIds = (ids) => {
        setSelectedColumnIds(ids);
        setSelectedTableIds(getSelectedTableIds(ids));
    };
    
    const clearJoinSettings = (ids) => {
        for (let i = 0; i < selectedTableIds.length; ++i) {
            treeViewData[selectedTableIds[i]].metadata.jointype = "";
        }
    };

    const getSelectedTableIds = (ids) => {
        let tset = new Set();

        for (let i = 0; i < ids.length; ++i) {
            let pid = treeViewData[ids[i]].parent;

            while (pid) {
                tset.add(pid);
                pid = treeViewData[pid].parent;
            }
        }

        let retval = [...tset];
        return retval;
    };
    
    const hideJoinType = () => {
        setShowJoinType({show: false});
    };
    
    const setJoinType = (joinType, nodeId) => {
        treeViewData[nodeId].metadata.jointype = joinType;
        let sc = [...selectColumns];
        
        for (let i = 0; i < sc.length; ++i) {
            if (sc[i].path.includes("{" + treeViewData[nodeId].metadata.fkname + "@")) {
                if ((joinType === "inner") && sc[i].path.includes("@outer}")) {
                    sc[i].path = sc[i].path.replace("@outer}", "@inner}");
                } else if ((joinType === "outer") && sc[i].path.includes("@inner}")) {
                    sc[i].path = sc[i].path.replace("@inner}", "@outer}");
                }
            }
        }

        let filc = [...filterColumns];
        
        for (let i = 0; i < filc.length; ++i) {
            if (filc[i].path.includes("{" + treeViewData[nodeId].metadata.fkname + "@")) {
                if ((joinType === "inner") && filc[i].path.includes("@outer}")) {
                    filc[i].path = filc[i].path.replace("@outer}", "@inner}");
                } else if ((joinType === "outer") && filc[i].path.includes("@inner}")) {
                    filc[i].path = filc[i].path.replace("@inner}", "@outer}");
                }
            }
        }

        let fc = [...fromClause];
        
        for (let i = 0; i < fc.length; ++i) {
            if (fc[i].foreignKeyName === treeViewData[nodeId].metadata.fkname) {
                if (joinType === "inner") {
                   fc[i].joinType = joinType;
                } else {
                   fc[i].joinType = "";
                }
            }
        }
        
        hideJoinType();
        setFromClause(fc);
        setFilterColumns(filc);
        setSelectColumns(sc);
        
    };
    
    const handleContextMenu = (e, element) => {
        if (element && element.metadata) {
            switch (String(element.metadata.type)) {
                case NODE_TYPE_ROOT:
                    break;
                case NODE_TYPE_TABLE:
                    break;
                case NODE_TYPE_COLUMN:
                    break;
                case NODE_TYPE_IMPORTED_FOREIGNKEY:
                case NODE_TYPE_EXPORTED_FOREIGNKEY:
                    e.preventDefault();
                    setShowJoinType({show: true, setJoinType: setJoinType, joinType: element.metadata.jointype, nodeId: element.id, hide: hideJoinType});
                    break;
            }
        }
    };

    const getNode = (element, handleSelect, isSelected, isBranch, isExpanded) => {
        if (isBranch) {
            return <span><TreeArrowIcon isOpen={isExpanded}/><span onContextMenu={(e) => handleContextMenu(e, element)} className="name">{getIcon(element)}&nbsp;{element.displayName ? element.displayName : element.name}</span></span>;
        } else {
            return <span><TreeCheckboxIcon
                    className="checkbox-icon"
                    onClick={(e) => onClick(e, element, handleSelect, isSelected)}
                    checked={isSelected}/><span className="name" onClick={(e) => onClick(e, element, handleSelect, isSelected)}>{getIcon(element)}{element.name}</span></span>;
        }
    };

    const nodeRenderer = (p) => {
        const {element,
            isBranch,
            isExpanded,
            isSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand} = p;
        return <div
        {...getNodeProps({onClick: handleExpand})}
        style={{marginLeft: 40 * (level - 1)}}
        >
        {getNode(element, handleSelect, isSelected, isBranch, isExpanded)}
    
    </div>
    };

    if (treeViewData) {
        return (<div className="tree-view">
        <JoinType config={showJoinType}/>
            <TreeView
                data={treeViewData}
                propagateCollapse={true}
                multiSelect={true}
                expandedIds={treeViewExpandedIds}
                selectedIds={selectedColumnIds}
                nodeRenderer={nodeRenderer}
                />
        </div>);
    } else {
        return <div style={{padding: "5px", overflow: "hidden"}}>{getText("Select a datasource", "...")}</div>;
    }
};

export default DataSelectTree;