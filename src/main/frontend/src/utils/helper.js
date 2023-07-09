import Confirmation from "../widgets/Confirmation";
;
import { createConfirmation } from 'react-confirm';

const defaultConfirmation = createConfirmation(Confirmation);

export function confirm(confirmation, options = {}) {
    return defaultConfirmation({confirmation, ...options});
}

export const SPECIAL_CHARACTERS = ["!", "@", "#", "$", "%", "^" < "&", "*", "(", ")", "{", "}", "[", "]", "?", "~"];
export const SUCCESS = "success";
export const ERROR = "error";
export const WARN = "warn";
export const INFO = "info";
export const SUCCESS_MESSAGE_TIMEOUT = 5000;
export const DEFAULT_SUCCESS_TITLE = "Success";
export const DEFAULT_ERROR_TITLE = "Error";
export const DEFAULT_WARN_TITLE = "Warning";

export const ERROR_BACKGROUND_COLOR = "pink";
export const ERROR_TEXT_COLOR = "crimson";
export const SUCCESS_TEXT_COLOR = "#228b22";
export const INFO_TEXT_COLOR = "#4682B4";

export const ADMINISTRATOR_ROLE = "administrator";
export const QUERY_DESIGNER_ROLE = "query designer";
export const REPORT_DESIGNER_ROLE = "report designer";

export const TYPE_PASSWORD = "password";
export const TYPE_DATE = "date";
export const TYPE_NUMBER = "number";
export const TYPE_EMAIL = "email";


export const SMALL_ICON_SIZE = 18;

export const isNotEmpty = (val) => {
    return val && ("" + val).length > 0;
};

export const isEmpty = (val) => {
    return !isNotEmpty(val);
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

export const setFieldError = (pre, fname) => {
    let el = document.getElementById(pre + fname);
    if (el) {
        el.style.background = ERROR_BACKGROUND_COLOR;
    }
};

export const setErrorMessage = (pre, msg) => {
    let el = document.getElementById(pre + "error-msg");
    if (el) {
        el.innerHTML = msg;
    }
};

export const checkEntryFields = (config) => {
    let retval = true;
    for (let i = 0; i < config.entryConfig.length; ++i) {
        if (config.entryConfig[i].required && isEmpty(config.dataObject[config.entryConfig[i].name])) {
            setFieldError(config.idPrefix, config.entryConfig[i].name);
            retval = false;
        } else if (config.entryConfig[i].validator) {
            switch (config.entryConfig[i].validator.type) {
                case TYPE_PASSWORD:
                    if (!isValidPassword(config.dataObject[config.entryConfig[i].name], config.entryConfig[i].validator)) {
                        setFieldError(config.idPrefix, config.entryConfig[i].name);
                        retval = false;
                    }
                    break;
                case TYPE_DATE:
                    if (!isValidDate(config.dataObject[config.entryConfig[i].name], config.entryConfig[i].validator)) {
                        setFieldError(config.idPrefix, config.entryConfig[i].name);
                        retval = false;
                    }
                    break;
                case TYPE_NUMBER:
                    if (!isValidNumber(config.dataObject[config.entryConfig[i].name], config.entryConfig[i].validator)) {
                        setFieldError(config.idPrefix, config.entryConfig[i].name);
                        retval = false;
                    }
                    break;
                case TYPE_EMAIL:
                    if (!isValidEmail(config.dataObject[config.entryConfig[i].name], config.entryConfig[i].validator)) {
                        setFieldError(config.idPrefix, config.entryConfig[i].name);
                        retval = false;
                    }
                    break;
            }
        }
    }

    return retval;
};

export const isValidPassword = (password, validator) => {
    if (password && (password.length > 8)) {
        if (password.toLowerCase() !== password) {
            for (let i = 0;
            i < SPECIAL_CHARACTERS.length; ++i) {
                if (password.includes(SPECIAL_CHARACTERS[i])) {
                    return true;
                }
            }
        }
    }

    return false;
};


export const isValidDate = (date, validator) => {
    if (!isEmpty(date) && !isNan(new Date.parse('date'))) {
        if (validator) {
            if (validator.min && validator.max) {
                return ((validator.min.getTime() <= date.getTime() && validator.max.getTime() >= date.getTime()));
            } else if (validator.min) {
                return date.getTime() >= validator.min.getTime()
            } else if (validator.max) {
                return date.getTime() <= validator.max.getTime();
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
};

export const isValidNumber = (number, validator) => {
    if (number && !isNan(number)) {
        if (validator) {
            if (validator.min && validator.max) {
                return ((validator.min <= number && validator.max >= number));
            } else if (validator.min) {
                return number >= validator.min.getTime();
            } else if (validator.max) {
                return number <= validator.max.getTime();
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
};

export const isValidEmail = (email, validator) => {
    return (email && email.includes("@") && email.includes("."));
};

export const updateJsonArray = (fieldName, newRec, data) => {
    let indx = -1;

    if (data && newRec) {
        let indx = data.findIndex((r) => r[fieldName] === newRec[fieldName]);
        if (indx > -1) {
            data[indx] = newRec;
        }
    }
};

export const replaceTokens = (msg, tokens) => {
    if (!tokens) {
        return msg;
    } else {
        for (let i = 0; i < tokens.length; ++i) {
            msg = msg.replace("$" + (i + 1), tokens[i]);
        }
    }
    
    return msg;
};


export const intersection = (a, b) => {
    if (a && a.length > 0 && b && b.length > 0) {
        const setA = new Set(a);
        return b.filter(value => setA.has(value));
    }
};
    