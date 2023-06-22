import React, { useState, createContext, useContext } from "react";
import {loadDatasources} from "../utils/apiHelper";

export const DataHandlerContext = createContext();

export const DataHandlerProvider = ({ children }) => {
    // set up initial state and reducer
    const [datasources, setDatasources] = useState(null);

    const initializeDataHandler = async () => {
        if (!datasources) {
            setDatasources(await loadDatasources());
        }
    }

    return (
            <DataHandlerContext.Provider
                value={{datasources, initializeDataHandler, setDatasources}}>
                {children}
            </DataHandlerContext.Provider>
            );
};

const useDataHandler = () => {
    const context = useContext(DataHandlerContext);

    if (context === undefined) {
        throw new Error("useDataHandler must be used within a DataHandlerProvider");
    }
    return context;
};

export default useDataHandler;
