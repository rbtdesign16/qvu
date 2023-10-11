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

const hconfig2 = {
    headers: {
        "Content-Type": "text/plain"
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
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};

    }
};

export const loadLang = async() => {
    try {
        let res = await axios.get(getApiURL() + "/lang/" + navigator.language + "/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};

    }
};

export const loadDatasources = async () => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasources/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadDocumentGroups = async () => {
    try {
        let res = await axios.get(getApiURL() + "/document/groups/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadDatabaseTypes = async () => {
    try {
        let res = await axios.get(getApiURL() + "/db/types/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const saveDatasource = async (ds) => {
    try {
        if (!ds.roles) {
            ds.roles = [];
        }
 
        let res = await axios.post(getApiURL() + "/db/datasource/save", ds, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const testDatasource = async (ds) => {
    try {
        if (!ds.roles) {
            ds.roles = [];
        }
        
        let res = await axios.post(getApiURL() + "/db/datasource/test", ds, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const deleteDatasource = async (dsname) => {

    try {
        let res = await axios.delete(getApiURL() + "/db/datasource/" + dsname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const saveRole = async (r) => {

    try {
        let res = await axios.post(getApiURL() + "/auth/role/save", r, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};


export const saveDocumentGroup = async (g) => {

    try {
        let res = await axios.post(getApiURL() + "/document/group/save", g, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const deleteDocumentGroup = async (gname) => {

    try {
        let res = await axios.delete(getApiURL() + "/document/group/" + gname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const deleteRole = async (rname) => {

    try {
        let res = await axios.delete(getApiURL() + "/auth/role/" + rname);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const saveUser = async (u) => {
    try {
        let res = await axios.post(getApiURL() + "/auth/user/save", u, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const deleteUser = async (uid) => {
    try {
        let res = await axios.delete(getApiURL() + "/auth/user/" + uid);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const verifyInitialRepositoryFolder = async (repositoryFolder) => {
    try {
        let res = await axios.post(getApiURL() + "/repo/verify", repositoryFolder, hconfig2);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const initializeRepository = async (repositoryFolder, adminPassword) => {
    try {
        let res = await axios.post(getApiURL() + "/repo/initialize", repositoryFolder + "|" + adminPassword, hconfig2);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};


export const formatErrorResponse = (errorResult, prefix) => {
    let retval = "";

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
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const getDatasourceTreeViewData = async (dsname) => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasource/" + dsname + "/treeview", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadTableSettings = async (datasource) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/tablesettings", datasource, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadColumnSettings = async (datasource, tableName) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/" + tableName + "/columnsettings", datasource, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadForeignKeySettings = async (datasource, tableName) => {
    try {
        let res = await axios.post(getApiURL() + "/db/datasource/" + tableName + "/fksettings", datasource, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadDatasourceTableNames = async (datasource) => {
    try {
        let res = await axios.get(getApiURL() + "/db/datasource/" + datasource + "/tablenames", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const saveDocument = async (d) => {
    try {
        let res = await axios.post(getApiURL() + "/document/save", d, hconfig);
        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const runQuery = async (doc, params) => {
    try {
        let runWrapper = {
            parameters: params,
            document: doc
        };

        let res = await axios.post(getApiURL() + "/query/design/run", runWrapper, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        console.log("error: runQuery - " + e);
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};


export const exportToExcel = async (excelExport) => {
    try {
        return await axios.post(getApiURL() + "/query/excel/export", excelExport, {responseType: "arraybuffer"});
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const getAvailableDocuments = async (documentType) => {
    try {
        let res = await axios.get(getApiURL() + "/documents/currentuser/" + documentType, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const getDocument = async (documentType, documentGroup, documentName) => {
    try {
        let res = await axios.get(getApiURL() + "/document/" + documentType + "/" + documentGroup + "/" + documentName, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const getSystemSettings = async() => {
    try {
        let res = await axios.get(getApiURL() + "/system/settings/load");

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};

    }
};

export const saveSystemSettings = async (config) => {
    try {
        let res = await axios.post(getApiURL() + "/system/settings/save", config, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadHelpDocument = async () => {
    try {
        let res = await axios.get(getApiURL() + "/help/" + navigator.language, {responseType: "arraybuffer"});
        return res.data;
    } catch (e) {
        console.log("error: loadHelpDocument - " + e);
    }
};

export const loadGettingStartedDocument = async () => {
    try {
        let res = await axios.get(getApiURL() + "/gettingstarted/" + navigator.language, {responseType: "arraybuffer"});
        return res.data;
    } catch (e) {
        console.log("error: loadGettingStartedDocument - " + e);
    }
};

export const backupRepository = async () => {
    try {
        let res = await axios.get(getApiURL() + "/admin/util/backup", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const loadDocumentSchedules = async () => {
    try {
        let res = await axios.get(getApiURL() + "/admin/document/schedules", hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const saveDocumentSchedules = async (schedules) => {
        try {
        let res = await axios.post(getApiURL() + "/admin/document/schedules/save", schedules, hconfig);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};

export const updateUserPassword = async (pass) => {
    try {
        let res = await axios.post(getApiURL() + "/admin/user/up", pass, hconfig2);

        if (res) {
            return res.data;
        }
    } catch (e) {
        return {errorCode: UNEXPECTED_EXCEPTION_CODE, message: e.message ? e.message : e.toString()};
    }
};