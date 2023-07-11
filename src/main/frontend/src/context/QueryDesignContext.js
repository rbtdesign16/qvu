import React, { createContext, useState, useContext } from "react";

export const QueryDesignContext = createContext();

export const QueryDesignProvider = ({ children }) => {
    const [treeViewData, setTreeViewData] = useState(null);
    const [baseTable, setBaseTable] = useState(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState([]);

    return (
            <QueryDesignContext.Provider
                value={{treeViewData, selectedNodeIds, baseTable, setTreeViewData, setSelectedNodeIds, setBaseTable}}>
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
