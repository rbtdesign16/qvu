import React, { createContext, useState, useContext, useEffect } from "react";
import {
    UNARY_COMPARISON_OPERATORS,
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime,
    isEmpty,
    updateAndOr,
    DEFAULT_NEW_DOCUMENT_NAME,
    DEFAULT_DOCUMENT_GROUP,
    doSortCompare,
    NODE_TYPE_IMPORTED_FOREIGNKEY,
    CUSTOM_FK_DATA_SEPARATOR,
    COMPARISON_OPERATOR_IN,
    copyObject
} from "../utils/helper";
import NumberEntry from "../widgets/NumberEntry";
import useLang from "./LangContext";

export const QueryDesignContext = createContext();

export const QueryDesignProvider = ({ children }) => {
    const {getText} = useLang();
    const [datasource, setDatasource] = useState(null);
    const [treeViewData, setTreeViewData] = useState(null);
    const [baseTable, setBaseTable] = useState(null);
    const [selectedColumnIds, setSelectedColumnIds] = useState([]);
    const [selectedTableIds, setSelectedTableIds] = useState([]);
    const [selectColumns, setSelectColumns] = useState([]);
    const [filterColumns, setFilterColumns] = useState([]);
    const [fromClause, setFromClause] = useState(null);
    const [currentResultsSort, setCurrentResultsSort] = useState({column: 0, direction: "asc"});
    const [currentFilters, setCurrentFilters] = useState({});
    const [splitter1Sizes, setSplitter1Sizes] = useState([25, 75]);
    const [queryResults, setQueryResults] = useState({header: [], data: []});
    const [treeViewExpandedIds, setTreeViewExpandedIds] = useState([]);
    const [currentDocument, setCurrentDocument] = useState({
        name: getText(DEFAULT_NEW_DOCUMENT_NAME),
        group: DEFAULT_DOCUMENT_GROUP,
        newRecord: true
    });
    
    const EMPTY_FILTER_VALUE = getText("empty-filter-value");
    
    const getColumnNameForDisplay = (s) => {
        let retval = "";

        if (s.aggregateFunction) {
            retval += (s.aggregateFunction + "(");
        }

        retval += s.displayName;

        if (s.aggregateFunction) {
            retval += ")";
        }

        return retval;
    };
    
    const isRowHidden = (rowdata) => {
        for (let i = 1; i < rowdata.length; ++i) {
            if (currentFilters[i] && (currentFilters[i].length > 0)) {
                if (isEmpty(rowdata[i])) {
                    if (!currentFilters[i].includes(EMPTY_FILTER_VALUE)) {
                        return true;
                    }
                } else if (!currentFilters[i].includes(String(rowdata[i]))) {
                    return true;
                }
            }
        }
    };


    const updateSelectColumns = (scols) => {
        let cols = [];
        let cMap = new Map();

        if (!scols) {
            scols = copyObject(selectColumns);
        }

        for (let i = 0; i < scols.length; ++i) {
            // may have multiple columsn for same path
            // in the SelectColumnList
            let c = cMap.get(scols[i].path);

            if (!c) {
                c = [];
            }

            c.push(scols[i]);
            cMap.set(scols[i].path, c);
        }

        let tablePathSet = new Set();

        for (let i = 0; i < selectedColumnIds.length; ++i) {
            let element = treeViewData[selectedColumnIds[i]];
            let table = treeViewData[element.parent].metadata.dbname;
            let path = getPath(element);
            
            let pos = path.lastIndexOf("|");

            if (pos > -1) {
                tablePathSet.add(path.substring(0, pos));
            } else {
                tablePathSet.add(path);
            }

            let c = cMap.get(path);
            if (c && (c.length > 0)) {
                for (let j = 0; j < c.length; ++j) {
                    c[j].path = path;
                    cols.push(c[j]);
                }
            } else {
                cols.push({
                    datasource: datasource,
                    tableName: table,
                    dataType: element.metadata.datatype,
                    dataTypeName: element.metadata.datatypename,
                    columnName: element.metadata.dbname,
                    displayName: element.name,
                    sortPosition: -1,
                    pkIndex: element.metadata.pkindex ? element.metadata.pkindex : -1,
                    aggregateFunction: "",
                    path: path,
                    customSql: "",
                    showInResults: true,
                    nodeId: selectedColumnIds[i],
                    parentType: treeViewData[element.parent].metadata.type,
                    fromClause,
                    setFromClause
                });
            }
        }
        
        setFromClause(buildFromRecords(copyObject(Array.from(tablePathSet)), cols));

        let pSet = new Set();
        
        for (let i = 0; i < cols.length; ++i) {
            pSet.add(cols[i].path);
        }

        if (filterColumns && (filterColumns.length > 0)) {
            let fc = [];
            for (let i = 0; i < filterColumns.length; ++i) {
                if (pSet.has(filterColumns[i].path)) {
                    fc.push(filterColumns[i]);
                }
            }

            if (filterColumns.length !== fc.length) {
                updateAndOr(fc);
                setFilterColumns(fc);
            }
        }

        setSelectColumns(cols);
    };

    const getJoinFromColumns = (part) => {
        let pos1 = part.indexOf("[");
        let pos2 = part.indexOf("]");

        let cols = part.substring(pos1 + 1, pos2).split(",");

        let retval = [];

        for (let i = 0; i < cols.length; ++i) {
            if (!cols[i].includes(CUSTOM_FK_DATA_SEPARATOR)) {
                retval.push(cols[i].substring(0, cols[i].indexOf("=")));
            }
        }

        return retval;
    };

    const getJoinToColumns = (part) => {
        let pos1 = part.indexOf("[");
        let pos2 = part.indexOf("]");

        let cols = part.substring(pos1 + 1, pos2).split(",");

        let retval = [];

        for (let i = 0; i < cols.length; ++i) {
            if (cols[i].includes(CUSTOM_FK_DATA_SEPARATOR)) {
                retval.push(cols[i]);
            } else {
                retval.push(cols[i].substring(cols[i].indexOf("=") + 1));
            }
        }

        return retval;
    };

    const getFromEntry = (parent, part, alias) => {
        let pos = part.lastIndexOf("|");
        if (pos > -1) {
            let lastEntry = part.substring(pos + 1);

            let pos1 = lastEntry.indexOf("{");
            let pos2 = lastEntry.indexOf("}");
            let pos3 = lastEntry.indexOf("@");

            let fromColumns = getJoinFromColumns(lastEntry);
            let toColumns = getJoinToColumns(lastEntry);

            return {
                alias: alias,
                fromAlias: parent.alias,
                joinType: lastEntry.substring(pos3 + 1, pos2),
                table: lastEntry.substring(0, pos1),
                foreignKeyName: lastEntry.substring(pos1 + 1, pos3),
                fromColumns: fromColumns,
                toColumns: toColumns
            };
        }
    };

    const buildFromRecords = (paths, cols) => {
        if (paths) {
            paths.sort((a, b) => {
                return (b.length - a.length);
            });
        }

        let tindx = 0;
        // root table
        let retval = [];
        retval.push({
            table: baseTable,
            alias: ("t" + (tindx++))
        });

        let jMap = new Map();

        jMap.set(baseTable, retval[0]);

        // break paths into unique join paths
        if (paths && (paths.length > 0) && (paths[0].indexOf("|") > -1)) {
            let requiredPaths = getRequiredJoinPaths(paths);

            let tindx = 1;
            let pos = -1;

            // create the from records based on the unique join paths
            for (let i = 0; i < requiredPaths.length; ++i) {
                let parent = baseTable;
                do {
                    let part;
                    pos = requiredPaths[i].indexOf("|", pos + 1);
                    if (pos > -1) {
                        part = requiredPaths[i].substring(0, pos);
                    } else {
                        part = requiredPaths[i].substring(0, paths[i].length);
                    }

                    if (!jMap.has(part)) {
                        let alias = ("t" + (tindx++));
                        let entry = getFromEntry(jMap.get(parent), part, alias);

                        if (entry) {
                            jMap.set(part, entry);
                            retval.push(entry);
                        }
                    }

                    parent = part;
                } while (pos > -1);
            }
        }
        
        for (let i = 0; i < cols.length; ++i) {
            let cpath = cols[i].path;
            let tpath = cpath.substring(0, cpath.lastIndexOf("|"));

            let jrec = jMap.get(tpath);

            if (jrec) {
                cols[i].tableAlias = jrec.alias;
            }
            
            if (cols[i].parentType === NODE_TYPE_IMPORTED_FOREIGNKEY) {
                jrec.importedForeignKey = true;
            }
        }

        return retval;
    };

    const getRequiredJoinPaths = (paths) => {
        let pSet = new Set();
        let pos = -1;
        for (let i = 0; i < paths.length; ++i) {
            do {
                pos = paths[i].indexOf("|", pos + 1);
                if (pos > -1) {
                    pSet.add(paths[i].substring(0, pos));
                } else {
                    pSet.add(paths[i], paths[i].substring(0, paths[i].length));
                }
            } while (pos > -1)
        }

        paths = copyObject(Array.from(pSet));

        paths.sort();

        let remitems = [];

        for (let i = 0; i < paths.length; ++i) {
            for (let j = i + 1; j < paths.length; ++j) {
                if (paths[j].includes(paths[i])) {
                    remitems.push(i);
                    break;
                }
            }
        }

        let retval = [];
        for (let i = 0; i < paths.length; ++i) {
            if (!remitems.includes(i)) {
                retval.push(paths[i]);
            }
        }

        retval.sort((a, b) => (b.length - a.length));

        return retval;
    };

    const getPath = (element) => {
        let elements = [];

        elements.unshift(element.metadata.dbname);
        let p = treeViewData[element.parent];

        while (p && (p.id > 0)) {
            let nm = p.metadata.dbname;
            if (p.metadata.type.endsWith("fk")) {
                nm += "{" + p.metadata.fkname + "@";
                nm += (p.metadata.jointype ? p.metadata.jointype : "outer");
                nm += "}";

                let comma = "";
                nm += "[";
                
                let tcols = [];
                let tcust = [];
                for (let i = 0; i < p.metadata.tocols.length; ++i) {
                    if (!p.metadata.tocols[i].includes(CUSTOM_FK_DATA_SEPARATOR)) {
                        tcols.push(p.metadata.tocols[i]);
                    } else {
                        tcust.push(p.metadata.tocols[i]);
                    }
                }
                
                for (let i = 0; i < p.metadata.fromcols.length; ++i) {
                    nm += (comma + p.metadata.fromcols[i] + "=" + tcols[i]);
                    comma = ",";
                }
                
                for (let i = 0; i < tcust.length; ++i) {
                    nm += comma + tcust[i];
                }

                nm += "]";
            }

            elements.unshift(nm);
            p = treeViewData[p.parent];
        }

        return elements.join("|");

    };

    const isParameterEntryRequired = () => {
        for (let i = 0; i < filterColumns.length; ++i) {
            if (!UNARY_COMPARISON_OPERATORS.includes(filterColumns[i].comparisonOperator) && isEmpty(filterColumns[i].comparisonValue)) {
                return true;
            }
        }
    };

    const buildRunDocument = (docname) => {
        return {
            name: docname,
            datasource: datasource,
            selectColumns: selectColumns,
            filterColumns: filterColumns,
            fromClause: fromClause
        };
    };

    const clearData = () => {
        setBaseTable(null);
        setSelectedColumnIds([]);
        setSelectedTableIds([]);
        setSelectColumns([]);
        setFilterColumns([]);
        setFromClause(null);
        setTreeViewExpandedIds([]);
        setQueryResults({header: [], data: []});
        setCurrentResultsSort({column: 0, direction: "asc"});
        setCurrentFilters({});
    };

    const setNewDocument = () => {
        setCurrentDocument({
            name: getText(DEFAULT_NEW_DOCUMENT_NAME),
            group: DEFAULT_DOCUMENT_GROUP, 
            newRecord: true});
        clearData();
    };

    const doSort = async (indx, type) => {
        if (queryResults && queryResults.data) {
            let data = queryResults.data;
            let columnTypes = queryResults.columnTypes;
            if (isCurrentSort(indx, type)) {
                data.sort((a, b) => a[0] - b[0]);
                setCurrentResultsSort({column: 0, direction: "asc"});
            } else {
                data.sort((a, b) => {
                    let val1;
                    let val2;

                    if (type === "asc") {
                        val1 = a[indx];
                        val2 = b[indx];
                    } else {
                        val1 = b[indx];
                        val2 = a[indx];
                    }
                    
                    return doSortCompare(columnTypes[indx], val1, val2);
                });
                
                setCurrentResultsSort({column: indx, direction: type});
            }
        }
    };

    const isCurrentSort = (indx, type) => {
        return ((currentResultsSort.column === indx) && (currentResultsSort.direction === type));
    };


    const setDocument = (doc) => {
    };

    useEffect(() => {
        updateSelectColumns();
    }, [selectedColumnIds]);

    useEffect(() => {
        clearData();
    }, [datasource]);

    return (
            <QueryDesignContext.Provider
                value={{
                                datasource,
                                treeViewData,
                                selectedColumnIds,
                                selectedTableIds,
                                baseTable,
                                selectColumns,
                                fromClause,
                                filterColumns,
                                setDatasource,
                                setTreeViewData,
                                setSelectedColumnIds,
                                setFromClause,
                                setSelectedTableIds,
                                setBaseTable,
                                setSelectColumns,
                                setFilterColumns,
                                updateSelectColumns,
                                splitter1Sizes,
                                setSplitter1Sizes,
                                isParameterEntryRequired,
                                buildRunDocument,
                                queryResults,
                                setQueryResults,
                                getColumnNameForDisplay,
                                setNewDocument,
                                setDocument,
                                currentDocument,
                                currentResultsSort,
                                setCurrentResultsSort,
                                doSort,
                                isCurrentSort,
                                currentFilters,
                                setCurrentFilters,
                                isRowHidden,
                                clearData,
                                setCurrentDocument,
                                treeViewExpandedIds,
                                setTreeViewExpandedIds
                            }}>
                {children}
            </QueryDesignContext.Provider>
            );
};

const useQueryDesign = () => {
    const context = useContext(QueryDesignContext);

    if (context === undefined) {
        throw new Error("useQueryDesign must be used within an QueryDesignProvider");
    }
    return context;
};

export default useQueryDesign;
