import Confirmation from "../widgets/Confirmation";
import { v4 as uuid } from 'uuid';
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

export const DEFAULT_DOCUMENT_GROUP = "general";
export const DEFAULT_NEW_DOCUMENT_NAME = "default document name";
export const QUERY_DOCUMENT_TYPE = "query";
export const REPORT_DOCUMENT_TYPE = "report";

export const SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "ORDER BY", "GROUP BY", "HAVING"];

export const ERROR_BACKGROUND_COLOR = "pink";
export const ERROR_TEXT_COLOR = "crimson";
export const SUCCESS_TEXT_COLOR = "#228b22";
export const INFO_TEXT_COLOR = "#4682B4";

export const COLOR_CRIMSON = "crimson";
export const COLOR_COBALT_BLUE = "#0020C2";
export const COLOR_BLACK = "black";

export const ADMINISTRATOR_ROLE = "administrator";
export const QUERY_DESIGNER_ROLE = "query designer";
export const REPORT_DESIGNER_ROLE = "report designer";
export const BASE_ROLES = [ADMINISTRATOR_ROLE, QUERY_DESIGNER_ROLE, REPORT_DESIGNER_ROLE];

export const TYPE_PASSWORD = "password";
export const TYPE_DATE = "date";
export const TYPE_NUMBER = "number";
export const TYPE_EMAIL = "email";

export const MODAL_TITLE_SIZE = "h5";
export const SPLITTER_GUTTER_SIZE = 8;
export const SMALL_ICON_SIZE = 18;
export const MEDIUM_ICON_SIZE = 20;
export const BIG_ICON_SIZE = 25;

export const DEFAULT_PIXELS_PER_CHARACTER = 12;

export const NODE_TYPE_ROOT = "r";
export const NODE_TYPE_TABLE = "t";
export const NODE_TYPE_COLUMN = "c";
export const NODE_TYPE_IMPORTED_FOREIGNKEY = "ifk";
export const NODE_TYPE_EXPORTED_FOREIGNKEY = "efk";

export const JDBC_TYPE_TINYINT = -6;
export const JDBC_TYPE_SMALLINT = 5;
export const JDBC_TYPE_INTEGER = 4;
export const JDBC_TYPE_BIGINT = -5;
export const JDBC_TYPE_REAL = 7;
export const JDBC_TYPE_DOUBLE = 8;
export const JDBC_TYPE_NUMERIC = 2;
export const JDBC_TYPE_DECIMAL = 3;
export const JDBC_TYPE_CHAR = 1;
export const JDBC_TYPE_VARCHAR = 12;
export const JDBC_TYPE_LONGVARCHAR = -1;
export const JDBC_TYPE_DATE = 91;
export const JDBC_TYPE_TIME = 92;
export const JDBC_TYPE_TIMESTAMP = 93;
export const JDBC_TYPE_BINARY = -2;
export const JDBC_TYPE_VARBINARY = -3;
export const JDBC_TYPE_LONGVARBINARY = -4;
export const JDBC_TYPE_BLOB = 2004;
export const JDBC_TYPE_CLOB = 2005;
export const JDBC_TYPE_BOOLEAN = 16;
export const JDBC_TYPE_NCHAR = -15;
export const JDBC_TYPE_NVARCHAR = -9;
export const JDBC_TYPE_LONGNVARCHAR = -16;
export const JDBC_TYPE_NCLOB = 2011;
export const JDBC_TYPE_TIME_WITH_TIMEZONE = 2013;
export const JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE = 2014;

export const OPEN_PARENTHESIS = ["", "(", "((", "((("];
export const CLOSE_PARENTHESIS = ["", ")", "))", ")))"];
export const AND_OR = ["and", "or"];
export const COMPARISON_OPERATORS = ["=", "<", "<=", ">", ">=", "<>", "in", "is null", "is not null", "like"];
export const UNARY_COMPARISON_OPERATORS = ["is null", "is not null"];

export const NUMBER_AGGREATE_FUNCTIONS = ["min", "max", "sum", "avg", "count"];
export const DATE_TIME_AGGREGATE_FUNCTIONS = ["min", "max", "count"];
export const STRING_AGGREATE_FUNCTIONS = ["count"];

export const DB_TYPE_MYSQL = "MySQL";
export const DB_TYPE_SQLSERVER = "Microsoft SQL Server";
export const DB_TYPE_ORACLE = "Oracle";
export const DB_TYPE_POSTGRES = "PostgreSQL";

export const ALLOWED_NUMERIC_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "enter", "minus", "period", "arrowleft", "arrowright", "arrowup", "arrowdown", "backspace", "tab", "delete", "insert"];
export const NUMERIC_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "minus"];
export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

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

export const checkColorString = (input) => {
    let retval = input;
    if (input) {
        if (!input.startsWith("#")) {
            retval = getHexColor(input);
        } else if (input.length === 4) {
            retval = input + input.substring(1);
        }
    }
    
    return retval;
}


export const getHexColor = (colorStr) => {
    var a = document.createElement('div');
    a.style.color = colorStr;
    var colors = window.getComputedStyle(document.body.appendChild(a)).color.match(/\d+/g).map(function (a) {
        return parseInt(a, 10);
    });
    document.body.removeChild(a);
    return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
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
                return date.getTime() >= validator.min.getTime();
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
    if (!email) {
        return true;
    } else {
        return (email.includes("@") && email.includes("."));
    }
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

export const findInArray = (items, fieldName, value) => {
    if (items) {
        for (let i = 0;
        i < items.length; ++i) {
            if (items[i][fieldName] === value) {
                return items[i];
            }
        }
    }
};


export const getUUID = () => {
    return uuid();
};

export const getAggregateFunctionsByDataType = (dataType) => {
    if (isDataTypeNumeric(dataType)) {
        return NUMBER_AGGREATE_FUNCTIONS;
    } else if (isDataTypeDateTime(dataType)) {
        return DATE_TIME_AGGREGATE_FUNCTIONS;
    } else {
        return STRING_AGGREATE_FUNCTIONS;
    }
};


export const isDataTypeNumeric = (type) => {
    return ((type === JDBC_TYPE_TINYINT)
            || (type === JDBC_TYPE_SMALLINT)
            || (type === JDBC_TYPE_INTEGER)
            || (type === JDBC_TYPE_BIGINT)
            || (type === JDBC_TYPE_REAL)
            || (type === JDBC_TYPE_DOUBLE)
            || (type === JDBC_TYPE_NUMERIC)
            || (type === JDBC_TYPE_DECIMAL));
};

export const isDataTypeDateTime = (type) => {
    return ((type === JDBC_TYPE_DATE)
            || (type === JDBC_TYPE_TIME)
            || (type === JDBC_TYPE_TIMESTAMP)
            || (type === JDBC_TYPE_TIME_WITH_TIMEZONE)
            || (type === JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE));
};


export const isDataTypeString = (type) => {
    return ((type === JDBC_TYPE_CHAR)
            || (type === JDBC_TYPE_VARCHAR)
            || (type === JDBC_TYPE_LONGVARCHAR)
            || (type === JDBC_TYPE_CLOB)
            || (type === JDBC_TYPE_NCHAR)
            || (type === JDBC_TYPE_NVARCHAR)
            || (type === JDBC_TYPE_LONGNVARCHAR)
            || (type === JDBC_TYPE_NCLOB));
};

export const isDataTypeFloat = (type, decimalDigits) => {
    if ((type === JDBC_TYPE_REAL) || (type === JDBC_TYPE_DOUBLE)) {
        return true;
    } else if ((type === JDBC_TYPE_NUMERIC) || (type === JDBC_TYPE_DECIMAL)) {
        return decimalDigits > 0;
    }
};

export const isSqlOrderByRequired = (selectColumns) => {
    if (selectColumns) {
        for (let i = 0;
        i < selectColumns.length; ++i) {
            if (selectColumns[i].sortPosition > 0) {
                return true;
            }
        }
    }
};

export const isSqlGroupByRequired = (selectColumns) => {
    if (selectColumns) {
        let agg = false;
        let nonagg = false;
        for (let i = 0; i < selectColumns.length; ++i) {
            if (selectColumns[i].aggregateFunction) {
                agg = true;
            } else {
                nonagg = true;
            }

            if (agg && nonagg) {
                return true;
            }
        }
    }
};

export const isSqlHavingRequired = (filterColumns) => {
    if (filterColumns) {
        for (let i = 0;
        i < filterColumns.length; ++i) {
            if (filterColumns[i].aggregateFunction) {
                return true;
            }
        }
    }
};

export const isSqlWhereRequired = (filterColumns) => {
    if (filterColumns) {
        for (let i = 0;
        i < filterColumns.length; ++i) {
            if (!filterColumns[i].aggregateFunction) {
                return true;
            }
        }
    }
};

export const isValidFilenameKey = (e) => {
    if (isEmpty(e.target.value)) {
        return isAlpha(e);
    } else if (!isAlphanumeric(e) && (e.code.toLowerCase() !== "minus")) {
        return false;
    } else {
        return true;
    }
};

export const isAlpha = (e) => {
    return /^[a-zA-Z]+$/.test(e.key);
};

export const isAlphanumeric = (e) => {
    return /^[a-zA-Z0-9]+$/.test(e.key);
};

export const isAllowedNumericKey = (e) => {
    if (e && e.code) {
        let code = e.code.toLowerCase();
        let val = e.target.value;
        let pos = e.target.selectionStart;
        if (code && (ALLOWED_NUMERIC_KEYS.includes(e.key) || ALLOWED_NUMERIC_KEYS.includes(code))) {
            if (code === "period") {
                return (!val.includes(".") && (pos > 0));
            } else if (code === "minus") {
                return isEmpty(val) || (!val.includes("-") && (pos === 0));
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
};

export const isNumericEntry = (e) => {
    let code = e.code.toLowerCase();
    return (code && (NUMERIC_KEYS.includes(e.key) || NUMERIC_KEYS.includes(code)));
};

export const isDigit = (e) => {
    return DIGITS.includes(e.key);
};

export const getQuotedIdentifier = (dbType) => {
    switch (dbType) {
        case DB_TYPE_MYSQL:
            return "`";
        case DB_TYPE_SQLSERVER:
        case DB_TYPE_ORACLE:
        case DB_TYPE_POSTGRES:
            return "\"";
    }
};

export const updateAndOr = (fc) => {
    let firstWhere = true;
    let firstHaving = true;
    for (let i = 0; i < fc.length; ++i) {
        if (fc[i].aggregateFunction) {
            if (firstHaving) {
                fc[i].andOr = "";
                firstHaving = false;
            } else if (!fc[i].andOr) {
                fc[i].andOr = AND_OR[0];
            }
        }

        if (!fc[i].aggregateFunction) {
            if (firstWhere) {
                fc[i].andOr = "";
                firstWhere = false;
            } else if (!fc[i].andOr) {
                fc[i].andOr = AND_OR[0];
            }
        }
    }
};

export const getDisplayDate = (input) => {
    let retval = input;

    if (retval) {
        if (input.length > 9) {
            retval = input.substring(0, 10);
        }
    }

    return retval;
};

export const getDisplayTimestamp = (input) => {
    let retval = input;

    if (retval) {
        if (input.length > 19) {
            retval = input.substring(0, 19).replace("T", " ");
        }
    }

    return retval;
};

export const getDisplayTime = (input) => {
    let retval = input;

    if (retval) {
        let pos = input.indexOf("T");
        if ((pos > -1) && (input.length > 17)) {
            retval = input.substring(pos + 2, 8);
        }
    }

    return retval;
};

export const doSortCompare = (dataType, val1, val2) => {
    if (isEmpty(val1) && val2) {
        return -1;
    } else if (isEmpty(val2) && val1) {
        return 1;
    } else {
        if (isDataTypeNumeric(dataType)) {
            return Number(val1) - Number(val2);
        } else if (isDataTypeDateTime(dataType)) {
            let t1 = new Date(val1);
            let t2 = new Date(val2);
            return t1 - t2;
        } else {
            return val1.localeCompare(val2);
        }
    }
};

