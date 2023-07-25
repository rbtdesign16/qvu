import axios from "axios";

export const SUCCESS_CODE = 0;
export const RECORD_EXISTS_CODE = 1;
export const EXISTING_RECORD_UPDATED_CODE = 2;
export const RECORD_NOT_FOUND_CODE = 3;
export const UNEXPECTED_EXCEPTION_CODE = 4;


const hconfig = {
    headers: {
        "Content-Type": "application/json"
    }
};

const getServer = () => {
    return window.location.hostname;
};

const getPort = () => {
    return window.location.port;
};

const getProtocol = () => {
    return window.location.protocol;
};

export const getServerURL = () => {
    return getProtocol() + "//" + getServer() + ":" + getPort() + "/qvu";
};

// Create API URL using build type from environment
export const getApiURL = () => {
    return getServerURL() + "/api/v1"; // Add the base API path
};


export const loadAuth = async() => {
    try {
        let res = await axios.get(getApiURL() + "/auth/data/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};

    }
};

export const loadLang = async() => {
    try {
        let res = await axios.get(getApiURL() + "/lang/" + navigator.language + "/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};

    }
};

export const loadDatasources = async () => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasources/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const loadDocumentGroups = async () => {
    try {
        let res = await axios.get(getApiURL() + "/document/groups/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const loadDatabaseTypes = async () => {
    try {
        let res = await axios.get(getApiURL() + "/db/types/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const saveDatasource = async (ds) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/save", ds, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const testDatasource = async (ds) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/test", ds, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const deleteDatasource = async (dsname) => {

    try {
        let res = await axios.delete(getApiURL() + "/db/datasource/" + dsname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const saveRole = async (r) => {

    try {
        let res = await axios.post(getApiURL() + "/auth/role/save", r, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};


export const saveDocumentGroup = async (g) => {

    try {
        let res = await axios.post(getApiURL() + "/document/group/save", g, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const deleteDocumentGroup = async (gname) => {

    try {
        let res = await axios.delete(getApiURL() + "/document/group/" + gname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const deleteRole = async (rname) => {

    try {
        let res = await axios.delete(getApiURL() + "/auth/role/" + rname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const saveUser = async (u) => {
    try {
        let res = await axios.post(getApiURL() + "/auth/user/save", u, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const deleteUser = async (uid) => {
    try {
        let res = await axios.delete(getApiURL() + "/auth/user/" + uid);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const verifyInitialRepositoryFolder = async (f) => {
    try {
        let res = await axios.get(getApiURL() + "/repo/init/verify?folder=" + f);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const doInitialSetup = async (cfg) => {
    try {
        let res = await axios.post(getApiURL() + "/repo/initialize", cfg, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};


export const formatErrorResponse = (errorResult, prefix) => {
    let retval ="";
    
    if (prefix) {
        retval += prefix;
    }
    
    if (errorResult.message) {
        retval += " " + errorResult.message;
    }
    
    return retval;
};

export const isApiError = (res) => {
    return !isApiSuccess(res);
};

export const isApiSuccess = (res) => {
    return (res && (res.errorCode === 0));
};

export const getDatasourceTables = async (dsname) => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasource/" + dsname + "/tables", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const getDatasourceTreeViewData = async (dsname) => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasource/" + dsname + "/treeview", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const loadTableSettings = async (datasource) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/tablesettings", datasource, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const loadColumnSettings = async (datasource, tableName) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/" + tableName + "/columnsettings", datasource, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const loadDatasourceTableNames = async (datasource) => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasource/" + datasource + "/tablenames", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const saveDocument = async (d) => {
    try {
        let res = await axios.post(getApiURL() + "/document/save", d, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};

export const runQuery = async (doc, params) => {
    try {
        let runWrapper = {
            parameters: params,
            document: doc
        }
        
        let res = await axios.post(getApiURL() + "/query/document/run", runWrapper, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e};
    }
};


