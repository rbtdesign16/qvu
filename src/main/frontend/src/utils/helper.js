import Confirmation from "../widgets/Confirmation";;
import { createConfirmation } from 'react-confirm';

const defaultConfirmation = createConfirmation(Confirmation);

export function confirm(confirmation, options = {}) {
  return defaultConfirmation({ confirmation, ...options });
}


export const SUCCESS = "success";
export const ERROR = "error";
export const WARN = "warn";
export const INFO = "info";


export const ADMINISTRATOR_ROLE = "administrator";
export const QUERY_DESIGNER_ROLE = "query designer";
export const REPORT_DESIGNER_ROLE = "report designer";


export const isNotEmpty = (val) => {
  return val && ("" + val).length > 0;
};

export const copyObject = (o) => {
  return JSON.parse(JSON.stringify(o));
};

export const loadDocumentFromBlob = async (fileName, blob) => {
  if (blob) {
    let downloadLink = document.createElement("a");
    downloadLink.target = "_blank";
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
};

export const userHasRole = (authData, role) => {
    if (authData.currentUser && authData.currentUser.roles) {
        return authData.currentUser.roles.includes(role);
    } 
};

export const isAdministrator = (authData) => {
    return userHasRole(authData, ADMINISTRATOR_ROLE);
};

export const isQueryDesigner = (authData) => {
    return userHasRole(authData, QUERY_DESIGNER_ROLE);
};

export const isReportDesigner = (authData) => {
    return userHasRole(authData, REPORT_DESIGNER_ROLE);
};