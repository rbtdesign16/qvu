import Confirmation from "../widgets/Confirmation";
import { v4 as uuid } from 'uuid';
import NumberEntry from "../widgets/NumberEntry";

import { createConfirmation } from 'react-confirm';

const defaultConfirmation = createConfirmation(Confirmation);

export function confirm(confirmation, options = {}) {
    return defaultConfirmation({confirmation, ...options});
}

export const SPECIAL_CHARACTERS = ["!", "@", "#", "$", "%", "^" < "&", "*", "(", ")", "{", "}", "[", "]", "?", "~"];

export const PDF_MIME_TYPE = "application/pdf";
export const SUCCESS = "success";
export const ERROR = "error";
export const WARN = "warn";
export const INFO = "info";
export const SUCCESS_MESSAGE_TIMEOUT = 5000;
export const DEFAULT_SUCCESS_TITLE = "Success";
export const DEFAULT_ERROR_TITLE = "Error";
export const DEFAULT_WARN_TITLE = "Warning";

export const DEFAULT_DOCUMENT_GROUP = "user";
export const DEFAULT_NEW_DOCUMENT_NAME = "default document name";
export const DEFAULT_NEW_REPORT_NAME = "default report name";
export const QUERY_DOCUMENT_TYPE = "query";
export const REPORT_DOCUMENT_TYPE = "report";

export const BASIC_SECURITY_TYPE = "basic";

export const DATA_TYPE = "data";
export const LABEL_TYPE = "label";
export const WIDTH_TYPE = "width";

export const SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "ORDER BY", "GROUP BY", "HAVING"];

export const ERROR_BACKGROUND_COLOR = "pink";
export const ERROR_TEXT_COLOR = "crimson";
export const SUCCESS_TEXT_COLOR = "#228b22";
export const INFO_TEXT_COLOR = "#4682B4";

export const COLOR_CRIMSON = "crimson";
export const COLOR_COBALT_BLUE = "#0020C2";
export const COLOR_BLACK = "black";
export const NONE_SETTING = "none";
export const TRANSPARENT_SETTING = "transparent";
export const ITALIC_SETTING = "italic";
export const UNDERLINE_SETTING = "underline";
export const FORMAT_SETTING = "displayFormat";

export const MODAL_TITLE_SIZE = "h5";
export const SPLITTER_GUTTER_SIZE = 8;
export const SMALL_ICON_SIZE = 18;
export const MEDIUM_ICON_SIZE = 20;
export const BIG_ICON_SIZE = 25;
export const EDIT_ACTION = "edit";
export const DELETE_ACTION = "delete";
export const SELECT_ACTION = "select";
export const SELECTALL_ACTION = "selectall";
export const DESELECT_ACTION = "deselect";
export const DESELECTALL_ACTION = "deselectall";

export const DEFAULT_PIXELS_PER_CHARACTER = 12;

export const NODE_TYPE_ROOT = "r";
export const NODE_TYPE_TABLE = "t";
export const NODE_TYPE_COLUMN = "c";
export const NODE_TYPE_IMPORTED_FOREIGNKEY = "ifk";
export const NODE_TYPE_EXPORTED_FOREIGNKEY = "efk";

export const JDBC_TYPE_TINYINT = -6;
export const JDBC_TYPE_BIT = -7;
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

export const TYPE_PASSWORD = "password";
export const TYPE_NUMBER = "number";
export const TYPE_EMAIL = "email";
export const TYPE_STRING = "string";
export const TYPE_DATE = "date";
export const TYPE_TIMESTAMP = "timestamp";
export const TYPE_TIME = "time";
export const TYPE_INTEGER = "integer";
export const TYPE_FLOAT = "float";
export const TYPE_BOOLEAN = "boolean";

export const OPEN_PARENTHESIS = ["", "(", "((", "((("];
export const CLOSE_PARENTHESIS = ["", ")", "))", ")))"];
export const AND_OR = ["and", "or"];
export const COMPARISON_OPERATOR_IN = "in";
export const COMPARISON_OPERATORS = ["=", "<", "<=", ">", ">=", "<>", COMPARISON_OPERATOR_IN, "is null", "is not null", "like"];
export const UNARY_COMPARISON_OPERATORS = ["is null", "is not null"];

export const NUMBER_AGGREATE_FUNCTIONS = ["min", "max", "sum", "avg", "count"];
export const DATE_TIME_AGGREGATE_FUNCTIONS = ["min", "max", "count"];
export const STRING_AGGREATE_FUNCTIONS = ["count"];

export const DB_TYPE_MYSQL = "MySQL";
export const DB_TYPE_SQLSERVER = "Microsoft SQL Server";
export const DB_TYPE_ORACLE = "Oracle";
export const DB_TYPE_POSTGRES = "PostgreSQL";

export const ALLOWED_NUMERIC_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "enter", "minus", "period", "arrowleft", "arrowright", "arrowup", "arrowdown", "backspace", "home", "end", "tab", "delete", "insert"];
export const NUMERIC_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "minus"];
export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const RESULT_SET_PAGE_SIZES = [100, 200, 300, 400, 500, 600, 800, 1000];
export const DEFAULT_PAGE_SIZE = 200;

export const ARROW_UP_KEY = "arrowup";
export const ARROW_DOWN_KEY = "arrowdown";
export const ARROW_LEFT_KEY = "arrowleft";
export const ARROW_RIGHT_KEY = "arrowright";


export const HOME_KEY = "arrowleft";
export const END_KEY = "arrowright";

export const DEFAULT_EXPORTED_KEY_DEPTH = 4;
export const DEFAULT_IMPORTED_KEY_DEPTH = 2;
export const CUSTOM_FK_DATA_SEPARATOR = "?";

export const RESULT_TYPE_EXCEL = "excel";
export const RESULT_TYPE_CSV = "csv";
export const RESULT_TYPE_JSON_FLAT = "jsonflat";
export const RESULT_TYPE_JSON_OBJECTGRAPH = "jsonobjectgraph";

export const ESCAPE_KEY_CODE = 27;

export const isNotEmpty = (val) => {
    return val && ("" + val).length > 0;
};

export const isEmpty = (val) => {
    return !isNotEmpty(val);
};

export const copyObject = (o) => {
    if (o) {
        return JSON.parse(JSON.stringify(o));
    } else {
        return o;
    }
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

export const showDocumentFromBlob = async (blob) => {
    if (blob) {
        let downloadLink = document.createElement("a");
        downloadLink.target = "_blank";
        downloadLink.href = window.URL.createObjectURL(blob);
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
};

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
    } else if (Array.isArray(tokens)){
        for (let i = 0; i < tokens.length; ++i) {
            msg = msg.replace("$" + (i + 1), tokens[i]);
        }
    } else {
        msg = msg.replace("$1", tokens);
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
    return (isDataTypeFloat(type) || isDataTypeInt(type));
};

export const isDataTypeFloat = (type) => {
    return ((type === JDBC_TYPE_REAL)
            || (type === JDBC_TYPE_DOUBLE)
            || (type === JDBC_TYPE_NUMERIC)
            || (type === JDBC_TYPE_DECIMAL));
};

export const isDataTypeInt = (type) => {
   return ((type === JDBC_TYPE_TINYINT)
            || (type === JDBC_TYPE_BIT)
            || (type === JDBC_TYPE_SMALLINT)
            || (type === JDBC_TYPE_INTEGER)
            || (type === JDBC_TYPE_BIGINT));
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
    } else if (!isAlphanumeric(e) && (e.code.toLowerCase() !== "minus") && (e.code.toLowerCase() !== "period")) {
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


export const getParameterTypeFromId = (id) => {
    let retval;
    switch (id) {
        case JDBC_TYPE_CHAR:
        case JDBC_TYPE_VARCHAR:
        case JDBC_TYPE_LONGVARCHAR:
        case JDBC_TYPE_NCHAR:
        case JDBC_TYPE_NVARCHAR:
        case JDBC_TYPE_LONGNVARCHAR:
            retval = TYPE_STRING;
            break;
        case JDBC_TYPE_TINYINT:
        case JDBC_TYPE_SMALLINT:
        case JDBC_TYPE_INTEGER:
        case JDBC_TYPE_BIGINT:
            retval = TYPE_INTEGER;
            break;
        case JDBC_TYPE_REAL:
        case JDBC_TYPE_DOUBLE:
        case JDBC_TYPE_NUMERIC:
        case JDBC_TYPE_DECIMAL:
            retval = TYPE_FLOAT;
            break;
        case JDBC_TYPE_DATE:
            retval = TYPE_DATE;
            break;
        case JDBC_TYPE_TIME:
        case JDBC_TYPE_TIME_WITH_TIMEZONE:
            retval = TYPE_TIME;
            break;
        case JDBC_TYPE_TIMESTAMP:
        case JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE:
            retval = TYPE_TIMESTAMP;
            break;
        case JDBC_TYPE_BOOLEAN:
            retval = TYPE_BOOLEAN;
            break
        default:
            retval = TYPE_STRING;
            break;
    }

    return retval;
};

export const getCurrentSelectValue = (e) => {
    return e.target.options[e.target.selectedIndex].value;
};


export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Octorber", "November", "December"];
export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const arraysEqual = (a1, a2, nosort = false) => {
    if (!a1 && !a2) {
        return true;
    } else if (a1 && a2 && (a1.length === a2.length)) {
        if (!nosort) {
            a1.sort();
            a2.sort();
        }

        for (let i = 0; i < a1.length; ++i) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }

        return true;
    }
};

export const getDigitsCount = (num) => {
    let s = num + "";
    return s.length;
};

export const isArrowKey = (e) => {
    if (e.code) {
        let code = e.code.toLowerCase();

        return (code === ARROW_LEFT_KEY 
            || code === ARROW_RIGHT_KEY
            || code === ARROW_UP_KEY
            || code === ARROW_DOWN_KEY);
    }
};

export const intersectRect = (r1, r2) => {
  return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top);
};


export const getColumnHelpDisplay = (columnData, getText) => {
    let pkindex = -1;
    if (columnData.pkindex) {
        pkindex = Number(columnData.pkindex);
    }

    if (pkindex > -1) {
        return <div className="entrygrid-125-550">
            <div className="label">{getText("Table Alias:")}</div><div>{columnData.tableAlias}</div>
            <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
            <div className="label">{getText("PK Index:")}</div><div>{pkindex}</div>
            <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
            <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
            <div className="label">{getText("Data Type ID:")}</div><div>{columnData.dataType}</div>
            <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
        </div>;
    } else {
        return <div className="entrygrid-125-550">
            <div className="label">{getText("Table Alias:")}</div><div>{columnData.tableAlias}</div>
            <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
            <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
            <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
            <div className="label">{getText("Data Type ID:")}</div><div>{columnData.dataType}</div>
            <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
        </div>;
    }
};

 export const formatPathForDisplay = (path, noColumnDisplay) => {
    let l = path.split("|");

    let end = l.length;

    if (noColumnDisplay) {
        end -= 1;
    }

    for (let i = 0; i < end; ++i) {
        if (l[i].includes("{")) {
            let pos1 = l[i].indexOf("{");
            let pos2 = l[i].indexOf("}");
            let fkcols = l[i].substring(0, pos1) + l[i].substring(pos2 + 1);
            l[i] = fkcols.replace("?", "");
        }
    }



    return l.join("->");
};

export const isString = (input) => {
    return (input && (typeof input === "string"));
};

export const getFilterComparisonInput = (filter, indx, onChange) => {
        let id = "f-" + indx;
        if (isDataTypeString(filter.dataType)) {
            return <input type="text" name="comparisonValue"  id={id} onBlur={e => onChange(e)}  style={{width: "98%"}} defaultValue={filter.comparisonValue} />;
        } else if (isDataTypeNumeric(filter.dataType)) {
            if (filter.comparisonOperator === COMPARISON_OPERATOR_IN) {
                return <input type="text" name="comparisonValue"  id={id} onBlur={e => onChange(e)}  style={{width: "98%"}} defaultValue={filter.comparisonValue} />;
            } else {
                return <NumberEntry name="comparisonValue"  id={id} onChange={e => onChange(e)} defaultValue={filter.comparisonValue} />;
            }
        } else if (isDataTypeDateTime(filter.dataType)) {
            if (filter.comparisonOperator === COMPARISON_OPERATOR_IN) {
                return <input type="text" name="comparisonValue"  id={id} onBlur={e => onChange(e)}  style={{width: "98%"}} defaultValue={filter.comparisonValue} />;
            } else {
                return <input type="date" id={id} name="comparisonValue" onBlur={e => onChange(e)} style={{width: "95%"}}  defaultValue={filter.comparisonValue}/>;
            }
        }
    };

