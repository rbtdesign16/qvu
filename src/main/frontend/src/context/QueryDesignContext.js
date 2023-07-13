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

    const updateSelectColumns  = async () => {
        let cols = [];
        let cMap = new Map();
        
        for (let i = 0; i < selectColumns.length; ++i) {
            cMap.set(selectColumns[i].path, selectColumns[i]);
        }
        
        let tablePathSet = new Set();
        
        for (let i = 0; i < selectedColumnIds.length; ++i) {
            let element = treeViewData[selectedColumnIds[i]];
            let table = treeViewData[element.parent].metadata.dbname;
            
            let path = getPath(element);
            
            let pos = path.lastIndexOf("|");
            
            tablePathSet.add(path.substring(0, pos));
            
            let c = cMap.get(path);
            if (c) {
                c.path = path;
                cols.push(c);
            } else {
                cols.push({
                    datasource: datasource,
                    tableName: table,
                    columnName: element.metadata.dbname,
                    displayName: element.name,
                    sortPosition: -1,
                    aggregateFunction: "",
                    path: path,
                    customSql: ""
                });
            }
        }
        
        createFrom([...tablePathSet]);

        setSelectColumns(cols);
    };
    
    const createFrom = async (paths) => {
         paths.sort((a, b) => {
            return (b.length - a.length);
        });
        
        console.log("---->" + paths);
    };
    
    const getPath = (element) => {
        let elements = [];
        
        elements.unshift(element.metadata.dbname);
        let p = treeViewData[element.parent];
        
        while (p && (p.id > 0)) {
            let nm = p.metadata.dbname;
            if (p.metadata.type.endsWith("fk")) {
                nm += "{";
                nm += (p.metadata.jointype ? p.metadata.jointype : "outer");
                nm += "}";
                
                let comma = "";
                nm += "[";
                
                for (let i = 0; i < p.metadata.fromcols.length; ++i) {
                    nm += (comma + p.metadata.fromcols[i] + "=" +  p.metadata.tocols[i]);
                }
                
                nm += "]";
                comma = ",";
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
                    updateSelectColumns}}>
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
