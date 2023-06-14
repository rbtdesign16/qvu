
const getServer = () => {
  return window.location.hostname;
}

const getPort = () => {
  return window.location.port;
}

export const getServerURL = () => {
  return "https://" + getServer() + ":" + getPort() + "/jrdemo";
}

// Create API URL using build type from environment
export const getApiURL = () => {
  return getServerURL() + "/api/v1"; // Add the base API path
}
