import React, { useState, createContext, useContext }
from "react";
import {loadDatasources, 
    loadDatabaseTypes, 
    loadDocumentGroups} from "../utils/apiHelper";
import {DB_TYPE_MYSQL,
    DB_TYPE_ORACLE,
    DB_TYPE_POSTGRES,
    DB_TYPE_SQLSERVER} from "../utils/helper";

export const DataHandlerContext = createContext();

export const DataHandlerProvider = ({ children }
) => {
// set up initial state and reducer
    const [datasources, setDatasources] = useState(null);
    const [databaseTypes, setDatabaseTypes] = useState(null);
    const [datasourceTableNames, setDatasourceTableNames] = useState({});
    const [documentGroups, setDocumentGroups] = useState([]);

    const initializeDataHandler = async () => {
        if (!datasources) {
            let res = await Promise.all([loadDatasources(), loadDatabaseTypes(), loadDocumentGroups()]);
            setDatasources(res[0]);
            setDatabaseTypes(res[1]);
            setDocumentGroups(res[2]);

        }
    };
    
    const isSchemaRequired = (datasourceName) => {
        switch(getDatabaseType(datasourceName)) {
            case DB_TYPE_MYSQL:
            case DB_TYPE_ORACLE:
            case DB_TYPE_POSTGRES:
                return false;
            case DB_TYPE_SQLSERVER:
                return true;
            default:
                return false;
        }
    };
    
    const getDatasource = (datasourceName) => {
        for (let i = 0; i < datasources.length; ++i) {
            if (datasourceName === datasources[i].datasourceName) {
                return datasources[i];
            }
        }
    };
    
    const getDatabaseType = (datasourceName) => {
        let ds = getDatasource(datasourceName);
        if (ds) {
            return ds.databaseType;
        }
    };

    const getDatasourceSchema = (datasourceName) => {
        let ds = getDatasource(datasourceName);
        if (ds) {
            return ds.schema;
        }
    };

    return (
            <DataHandlerContext.Provider
                value={{datasources,
                    databaseTypes,
                    initializeDataHandler,
                    setDatasources,
                    datasourceTableNames,
                    setDatasourceTableNames,
                    documentGroups,
                    setDocumentGroups,
                    getDatabaseType,
                    getDatasourceSchema,
                    isSchemaRequired}}>
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
