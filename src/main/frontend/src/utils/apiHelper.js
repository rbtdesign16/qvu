import axios from "axios";

export const hconfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

const getServer = () => {
  return window.location.hostname;
}

const getPort = () => {
  return window.location.port;
}

const getProtocol = () => {
  return window.location.protocol;
}

export const getServerURL = () => {
  return getProtocol() + "//" + getServer() + ":" + getPort() + "/qvu";
}

// Create API URL using build type from environment
export const getApiURL = () => {
  return getServerURL() + "/api/v1"; // Add the base API path
}


export const loadAuth = async() => {
    let res = await axios.get(getApiURL() + "/auth/data/load");
    
}

