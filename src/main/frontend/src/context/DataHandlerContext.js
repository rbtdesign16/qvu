import React, { useState, createContext, useContext } from "react";
import {loadDatasources, loadDatabaseTypes} from "../utils/apiHelper";

export const DataHandlerContext = createContext();

export const DataHandlerProvider = ({ children }) => {
    // set up initial state and reducer
    const [datasources, setDatasources] = useState(null);
    const [databaseTypes, setDatabaseTypes] = useState(null);

    const initializeDataHandler = async () => {
        if (!datasources) {
            let res = await Promise.all([loadDatasources(), loadDatabaseTypes()]);
            setDatasources(res[0]);
            setDatabaseTypes(res[1]);
        }
    };

    return (
            <DataHandlerContext.Provider
                value={{datasources, databaseTypes, initializeDataHandler, setDatasources}}>
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
