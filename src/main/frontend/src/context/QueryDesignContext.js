import React, { createContext, useState, useContext } from "react";

export const QueryDesignContext = createContext();

export const QueryDesignProvider = ({ children }) => {
    const [treeViewData, setTreeViewData] = useState(null);
    const [baseTable, setBaseTable] = useState(null);
    const [selectedColumnIds, setSelectedColumnIds] = useState([]);
    const [selectedTableIds, setSelectedTableIds] = useState([]);
    const [selectColumns, setSelectColumns] = useState([]);
    const [filterColumns, setFilterColumns] = useState([]);

    return (
            <QueryDesignContext.Provider
                value={{treeViewData, 
                    selectedColumnIds, 
                    selectedTableIds, 
                    baseTable, 
                    selectColumns, 
                    filterColumns, 
                    setTreeViewData, 
                    setSelectedColumnIds, 
                    setSelectedTableIds, 
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
