import axios from "axios";

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
    let res = await axios.get(getApiURL() + "/auth/data/load");

    if (res) {
        return res.data;
    }
};

export const loadDatasources = async () => {
    let res = await axios.get(getApiURL() + "/db/datasources/load");

    if (res) {
        return res.data;
    }
};

export const saveDatasource = async (ds) => {
    let res = await axios.post(getApiURL() + "/db/datasource/save", ds, hconfig);

    if (res) {
        return res.data;
    }
};

export const deleteDatasource = async (dsname) => {
    let res = await axios.delete(getApiURL() + "/db/datasource/" + dsname);

    if (res) {
        return res.data;
    }
};

export const saveRole = async (r) => {
    let res = await axios.post(getApiURL() + "/auth/role/save", r, hconfig);

    if (res) {
        return res.data;
    }
};

export const deleteRole = async (rname) => {
    let res = await axios.delete(getApiURL() + "/auth/roles/" + rname);

    if (res) {
        return res.data;
    }
};

export const saveUser = async (u) => {
    let res = await axios.post(getApiURL() + "/auth/user/save", u, hconfig);

    if (res) {
        return res.data;
    }
};

export const deleteUser = async (uid) => {
    let res = await axios.delete(getApiURL() + "/auth/user/" + uid);

    if (res) {
        return res.data;
    }
};
