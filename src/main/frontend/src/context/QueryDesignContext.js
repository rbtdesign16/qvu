import React, { createContext, useState, useContext, useEffect } from "react";

export const QueryDesignContext = createContext();

export const QueryDesignProvider = ({ children }) => {
    const [datasource, setDatasource] = useState(null);
    const [treeViewData, setTreeViewData] = useState(null);
    const [baseTable, setBaseTable] = useState(null);
    const [selectedColumnIds, setSelectedColumnIds] = useState([]);
    const [selectedTableIds, setSelectedTableIds] = useState([]);
    const [selectColumns, setSelectColumns] = useState([]);
    const [filterColumns, setFilterColumns] = useState([]);
    const [from, setFrom] = useState([]);

    const updateSelectColumns = async (scols) => {
        let cols = [];
        let cMap = new Map();
        
        if (!scols) {
            scols = [...selectColumns];
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
                    pkindex: element.metadata.pkindex ? element.metadata.pkindex : -1,
                    aggregateFunction: "",
                    path: path,
                    customSql: "",
                    nodeId: selectedColumnIds[i]
                });
            }
        }

        setFrom(buildFromRecords([...tablePathSet], cols));
        setSelectColumns(cols);
    };
    
    const formatPathForDisplay = (path) => {
        let l = path.split("|");
        
        for (let i = 0; i < l.length; ++i) {
            if (l[i].includes("{")) {
                let pos1 = l[i].indexOf("{");
                let pos2 = l[i].indexOf("}");
                l[i] = l[i].substring(0, pos1) + l[i].substring(pos2+1);
            }
        }
        
        
            
        return l.join(" -> ");
    };
    
    const getJoinFromColumns = (part) => {
        let pos1 = part.indexOf("[");
        let pos2 = part.indexOf("]");
        
        let cols = part.substring(pos1 + 1, pos2).split(",");
        
        let retval = [];
        
        for (let i = 0; i < cols.length; ++i) {
             retval.push(cols[i].substring(0, cols[i].indexOf("=")));
        }
        
        return retval;
    };
    
    const getJoinToColumns = (part) => {
       let pos1 = part.indexOf("[");
        let pos2 = part.indexOf("]");
        
        let cols = part.substring(pos1 + 1, pos2).split(",");
        
        let retval = [];
        
        for (let i = 0; i < cols.length; ++i) {
             retval.push(cols[i].substring(cols[i].indexOf("=") + 1));
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
               fromColumns: fromColumns,
               toColumns: toColumns
           };
        }
    };

    const buildFromRecords = async (paths, cols) => {
        paths.sort((a, b) => {
            return (b.length - a.length);
        });
        
        
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

        paths = [...pSet];
        
        paths.sort();

        let remitems = [];

        for (let i = 0; i < paths.length; ++i) {
            for (let j = i+1; j < paths.length; ++j) {
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
                for (let i = 0; i < p.metadata.fromcols.length; ++i) {
                    nm += (comma + p.metadata.fromcols[i] + "=" + p.metadata.tocols[i]);
                    comma = ",";
                }

                nm += "]";
            }

            elements.unshift(nm);
            p = treeViewData[p.parent];
        }

        return elements.join("|");

    };

    useEffect(() => {
        updateSelectColumns();
    }, [selectedColumnIds]);
    return (
            <QueryDesignContext.Provider
                value={{
                    datasource,
                    treeViewData,
                    selectedColumnIds,
                    selectedTableIds,
                    baseTable,
                    selectColumns,
                    from,
                    filterColumns,
                    setDatasource,
                    setTreeViewData,
                    setSelectedColumnIds,
                    setFrom,
                    setSelectedTableIds,
                    setBaseTable,
                    setSelectColumns,
                    setFilterColumns,
                    updateSelectColumns,
                    formatPathForDisplay}}>
                {children}
            </QueryDesignContext.Provider>
            );
};

const useQueryDesign = () => {
    const context = useContext(QueryDesignContext);

    if (context === undefined) {
        throw new Error("useHelp must be used within an HelpProvider");
    }
    return context;
};

export default useQueryDesign;