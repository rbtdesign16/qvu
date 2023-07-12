import React, { createContext, useState, useContext } from "react";

export const QueryDesignContext = createContext();

export const QueryDesignProvider = ({ children }) => {
    const [treeViewData, setTreeViewData] = useState(null);
    const [baseTable, setBaseTable] = useState(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState([]);
    const [selectColumns, setSelectColumns] = useState([]);
    const [filterColumns, setFilterColumns] = useState([]);

    return (
            <QueryDesignContext.Provider
                value={{treeViewData, 
                    selectedNodeIds, 
                    baseTable, 
                    selectColumns, 
                    filterColumns, 
                    setTreeViewData, 
                    setSelectedNodeIds, 
                    setBaseTable,
                    setSelectColumns,
                    setFilterColumns}}>
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
