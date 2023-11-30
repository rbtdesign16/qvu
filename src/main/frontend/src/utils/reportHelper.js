import {copyObject} from "./helper";
import moment from "moment";
import javadatefp from "moment-jdateformatparser";

import {NONE_SETTING,
    TRANSPARENT_SETTING, 
    ITALIC_SETTING, 
    UNDERLINE_SETTING} from "./helper";

export const COMPONENT_DRAG_DATA = "cinfo";
export const MOVE_DROP_EFFECT = "move";
export const OPACITY_OPTIONS = [1, 0.75, 0.5, 0.25];
    
const getPPI = () => {
    const el = document.createElement('div');
    el.style = "width: 1in;";
    document.body.appendChild(el);
    let retval = el.offsetWidth;
    document.body.removeChild(el);
    return retval;
};

export const PIXELS_PER_INCH = getPPI();
export const PIXELS_PER_MM = PIXELS_PER_INCH / 25.4;
export const PIXELS_PER_POINT = 1.75;
export const MM_TO_INCHES = 0.0393701;
export const INCHES_TO_MM = 25.4;      

export const DEFAULT_MM_COMPONENT_POS = {left: 5, top: 5, height: 5, width: 10};    
export const DEFAULT_INCH_COMPONENT_POS = {left: 0.5, top: 0.5, height: 0.5, width: 1};    

export const REPORT_ORIENTATION_LANDSCAPE = "landscape";
export const REPORT_ORIENTATION_PORTRAIT = "portrait";
export const REPORT_UNITS_INCH = "inch";
export const REPORT_UNITS_MM = "mm";

export const REPORT_SECTION_HEADER = "header";
export const REPORT_SECTION_BODY = "body";
export const REPORT_SECTION_FOOTER = "footer";
export const REPORT_SECTION_BORDER = "solid 1px blue";

export const MAX_UNDOS = 3;

// use for sizing logic
export const COMPONENT_SIZING_RECT_WIDTH = 5;
export const TOP_LEFT = "tl";
export const TOP_RIGHT = "tr";
export const BOTTOM_RIGHT = "br";
export const BOTTOM_LEFT = "bl";
export const PIXELS_PER_KEYDOWN_MOVE = 5;
export const TOBACK_ACTION = "toback";
export const TOFRONT_ACTION = "tofront";

export const BORDER_STYLE_SOLID = "solid";

export const COMPONENT_TYPE_TEXT = "text";   
export const COMPONENT_TYPE_IMAGE = "image";  
export const COMPONENT_TYPE_SHAPE = "shape";  
export const COMPONENT_TYPE_EMAIL = "email";   
export const COMPONENT_TYPE_HYPERLINK = "hyperlink";  
export const COMPONENT_TYPE_PAGENUMBER = "pagenumber";  
export const COMPONENT_TYPE_CURRENTDATE = "currentdate";   
export const COMPONENT_TYPE_DATAGRID = "datagrid";  
export const COMPONENT_TYPE_DATARECORD = "datarecord";   
export const COMPONENT_TYPE_CHART = "chart";  
export const COMPONENT_TYPE_SUBREPORT = "subreport";
export const MIN_LASSO_CHANGE = 10;

export const SHAPE_HORIZONTAL_LINE = "horizontal line";
export const SHAPE_VERTICAL_LINE = "vertical line";
export const SHAPE_ELLIPSE = "ellipse";
export const SHAPE_ROUNDED_RECTANGLE = "rounded rectangle";
export const SHAPE_RECTANGLE = "rectangle";

export const DEFAULT_SHAPE = SHAPE_RECTANGLE;

export const PAGE_NUMBER_FORMATS = [
    "?",
    "?.",
    "[?]",
    "(?)"];
export const DEFAULT_PAGE_NUMBER_FORMAT = PAGE_NUMBER_FORMATS[0];

export const DEFAULT_CURRENT_DATE_FORMAT = "yyyy-MM-dd";
export const TEXT_ALIGN_OPTIONS = ["left", "center", "right"];
export const DEFAULT_HEADER_TEXT_ALIGN = "center";
export const DEFAULT_DATA_TEXT_ALIGN = "center";
export const BOLD_FONT_WEIGHT = 700;
export const STANDARD_FONT_WEIGHT = 400;

export const pixelPosToNumber = (pos) => {
    if (pos) {
        return Number(pos.replace("px", ""));
    }
};

export const getSizer = (sec) => {
    return document.getElementById("sz-" + sec);
};
    
export const pixelsToReportUnits = (type, pixels) => {
    if (type) {
        if (type.length > 2) {
            type = type.substring(0, 2);
        }
        
        if (type === REPORT_UNITS_MM) {
            return pixels / PIXELS_PER_MM;
        } else {
            return pixels / PIXELS_PER_INCH;
        }
    }
};

const getGridHeaderStyle = (component) => {
     let retval = {
        height: PIXELS_PER_POINT * Number(component.fontSettings.size),
        fontFamily: component.fontSettings.font,
        fontSize: component.fontSettings.size + "pt",
        color: component.fontSettings.color,
        backgroundColor: component.fontSettings.backgroundColor
        
    };
    
    if (component.fontSettings.bold) {
        retval.fontWeight = BOLD_FONT_WEIGHT;
    }

    if (component.fontSettings.italic) {
        retval.fontStyle = ITALIC_SETTING;
    }

    if (component.fontSettings.underline) {
        retval.textDecoration = UNDERLINE_SETTING;
    }
    
    if (component.borderSettings) {
        retval.border = component.borderSettings.border + " " + component.borderSettings.width + "px " + component.borderSettings.color;
    }
    
    return retval;
};

const getGridDataStyle = (component) => {
     let retval = {
        height: PIXELS_PER_POINT * Number(component.fontSettings2.size),
        fontFamily: component.fontSettings2.font,
        fontSize: component.fontSettings2.size + "pt",
        color: component.fontSettings2.color,
        backgroundColor: component.fontSettings2.backgroundColor
        
    };
    
    if (component.fontSettings2.bold) {
        retval.fontWeight = BOLD_FONT_WEIGHT;
    }

    if (component.fontSettings2.italic) {
        retval.fontStyle = ITALIC_SETTING;
    }

    if (component.fontSettings2.underline) {
        retval.textDecoration = UNDERLINE_SETTING;
    }
    
    if (component.borderSettings2) {
        retval.border = component.borderSettings2.border + " " + component.borderSettings2.width + "px " + component.borderSettings2.color;
    }
    
    return retval;
};

const getGridComponentStyle = (component) => {
    let retval = {
        display: "grid",
        gridTemplateColumns: component.value.gridTemplateColumns,
        margin: 0,
        padding:0,
        gridRowGap: 0
    };
    
    return retval;
};
    
const getGridHeader = (component, myStyle) => {
    let styles = [];
    
    component.value.dataColumns.map(d => {
        let s = {...myStyle};
        let ta = d.headerTextAlign;
        if (!ta) {
            ta = DEFAULT_DATA_TEXT_ALIGN;
        }
    
        s.textALign = ta;
        
        styles.push(s);
    });
    
   return component.value.dataColumns.map((c, indx) => {
        return <div style={styles[indx]}>
            {c.displayName}
        </div>;
    });
};

const getGridExampleData = (currentReport, component) => {
    let retval = [];
    let headerHeight = pixelsToReportUnits(currentReport.pageUnits, PIXELS_PER_POINT * Number(component.fontSettings.size));
    let rowHeight = pixelsToReportUnits(currentReport.pageUnits, PIXELS_PER_POINT * Number(component.fontSettings2.size));
    let numRows = Math.floor(((component.height - headerHeight) / rowHeight));
    
     for (let i = 0; i < numRows; ++i) {
        let row = [];
        for (let j = 0; j < component.value.dataColumns.length; ++j) {
           row.push((i+1) + ":" + (j+1));
        }
       
       retval.push(row);
    }
    
     return retval;
};
    
const getGridData = (component, exampleData, myStyle) => {
    let styles = [];
    
    component.value.dataColumns.map(d => {
        let s = {...myStyle};
        let ta = d.dataTextAlign;
        if (!ta) {
            ta = DEFAULT_DATA_TEXT_ALIGN;
        }
    
        s.textAlign = ta;
        
        styles.push(s);
    });
    
    return exampleData.map(r => {
        return r.map((c, indx) => {
            return <div style={styles[indx]}>{c}</div>;
        });
    });
};
    
const getDataGridComponentValue = (currentReport, component) => {
    let headerStyle = getGridHeaderStyle(component);
    let dataStyle = getGridDataStyle(component);
    return <div style={getGridComponentStyle(component)}>
        {getGridHeader(component, headerStyle)}
        {getGridData(component, getGridExampleData(currentReport, component), dataStyle)}
    </div>;
};

export const getComponentValue = (reportSettings, currentReport, component, forExample) => {
    let myStyle = {};
    
    switch (component.type) {
        case COMPONENT_TYPE_TEXT:
            return component.value;
        case COMPONENT_TYPE_HYPERLINK:
            if (!component.value.underline) {
                myStyle.textDecoration = NONE_SETTING;
            }
            return <a style={myStyle} href={component.value.url} target="_blank">{component.value.text}</a>;
        case COMPONENT_TYPE_EMAIL:
            if (!component.value.underline) {
                myStyle.textDecoration = NONE_SETTING;
            }
            return <a style={myStyle} href={"mailto:" + component.value.to + (component.value.subject ? "?\nsubject=" + component.value.subject : "")} target="_blank">{component.value.text}</a>;
        case COMPONENT_TYPE_IMAGE:
            if (component.value.sizetofit) {
                myStyle.width = "100%";
                myStyle.height = "100%";
            }
            if (component.value.linkurl) {
                myStyle.cursor = "pointer";
                return <a style={{textDecoration: NONE_SETTING}} href={component.value.linkurl} target="_blank"><img style={myStyle} alt={component.value.alttext} src={component.value.url} /></a>;
            } else {
                return <img style={myStyle} alt={component.value.alttext} src={component.value.url}/>;
            }
        case COMPONENT_TYPE_SHAPE:
            if ((component.value.shape === SHAPE_HORIZONTAL_LINE)
                    || (component.value.shape === SHAPE_VERTICAL_LINE)) {
                myStyle.backgroundColor = component.value.fillcolor;
                
                if (!forExample) {
                    myStyle.position = "absolute";
                }
                
                if (component.value.shape === SHAPE_HORIZONTAL_LINE) {
                    myStyle.width = "100%";
                    myStyle.height = component.value.width + "px";
                    myStyle.top = "50%";
                } else {
                    myStyle.width = component.value.width + "px";
                    myStyle.height = "100%";
                    myStyle.marginLeft = "50%" ;
                }
            } else {
                myStyle.height = "100%";
                myStyle.width = "100%";
                
                if (component.value.wantborder) {
                    myStyle.border = component.value.border + " " + component.value.width + "px " + component.value.bordercolor;
                } else {
                    myStyle.border = NONE_SETTING;
                }
                
                if (component.value.opacity) {
                    myStyle.opacity = Number(component.value.opacity);
                }
                
                if (component.value.wantfilled) {
                    myStyle.background = component.value.fillcolor;
                } else {
                    myStyle.background = TRANSPARENT_SETTING;
                }

                switch (component.value.shape) {
                    case SHAPE_ELLIPSE:
                        myStyle.borderRadius = "50%";
                        break;
                    case SHAPE_ROUNDED_RECTANGLE:
                        myStyle.borderRadius = reportSettings.defaultBorderRadius;
                        break;
                }
            }
            
            return <div style={myStyle}></div>;
        case COMPONENT_TYPE_CURRENTDATE:
            return moment().formatWithJDF(component.value.format); 
        case COMPONENT_TYPE_PAGENUMBER:
            return component.value.format.replace("?", "1");
        case COMPONENT_TYPE_DATAGRID:
            return getDataGridComponentValue(currentReport, component);
        case COMPONENT_TYPE_DATARECORD:
           return getDataRecordComponentValue(component);
    }
};

 export const getShapeOptions = (reportSettings, valueObject) => {
    return reportSettings.reportShapes.map(s => {
        if (s === valueObject[COMPONENT_TYPE_SHAPE]) {
            return <option value={s} selected>{s}</option>;
        } else {
            return <option value={s}>{s}</option>;
        }
    });
};

export const haveAllBorders = (bs) => {
    return (bs.left && bs.top && bs.right && bs.bottom);
};

export const haveBorder = (bs) => {
    return (bs.left || bs.top || bs.right || bs.bottom);
};

export const getBorderStyleOptions = (reportSettings, bs, noNone) => {
    return reportSettings.borderStyles.map(b => {
        if (!noNone || (b !== NONE_SETTING)) {
            if (bs.border === b) {
                return <option value={b} selected>{b}</option>;
            } else {
                return <option value={b}>{b}</option>;
            }  
        } else {
            return "";
        }
    });
};
    
export const getBorderWidthOptions = (reportSettings, bs) => {
    return reportSettings.borderWidths.map(w => {
        if (bs.width == w) {
            return <option value={w} selected>{w}</option>;
        } else {
            return <option value={w}>{w}</option>;
        }  
    });
};

export const getOpacityOptions = (valueObject) => {
    return OPACITY_OPTIONS.map(o => {
        if (o == valueObject.opacity) {
            return <option value={o} selected>{o}</option>;
        } else {
            return <option value={o}>{o}</option>;
        }
    });
};
    
const getShapeComponentStyle = (component, unit) => {
    return {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
            cursor: "pointer",
            value: {shape: DEFAULT_SHAPE, wantborder: true, border: "solid", width: 1, wantfilled: false},
            background: TRANSPARENT_SETTING,
            zIndex: component.zindex
        };
};

export const reformatDataComponent = (currentReport, component) => {
    let numcols = component.value.dataColumns.length;
    let cwidth = component.width / numcols;

    let gtc = "";
    let unit = currentReport.pageUnits.substring(0, 2);
    for (let i = 0; i < numcols; ++i) {
        gtc += (cwidth + unit + " ");
    }

    component.value.gridTemplateColumns = gtc.trim();
};

export const isDataComponent = (type) => {
    return type = ((type === COMPONENT_TYPE_DATAGRID) 
        || (type === COMPONENT_TYPE_DATARECORD));
};

export const getDefaultComponentStyle = (reportSettings, component, unit) => {
    let retval = {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
            cursor: "pointer",
            textAlign: component.align,
            zIndex: component.zindex
        };
    
    if (!isDataComponent(component.type)) {
        if (component.fontSettings) {
            let fs = component.fontSettings;
            retval.color = fs.color,
            retval.backgroundColor = fs.backgroundColor,
            retval.fontFamilty = fs.font;
            retval.fontSize = fs.size + "pt";
            if (fs.italic) {
                retval.fontStyle = ITALIC_SETTING;
            }

            if (fs.bold) {
                retval.fontWeight = BOLD_FONT_WEIGHT;
            }

            if (fs.underline) {
                retval.textDecoration = UNDERLINE_SETTING;
            }
        }

        if (component.borderSettings) {
            let bs = component.borderSettings;
            if (haveBorder(bs)) {
                let bdef = bs.border + " " + bs.width + "px " + bs.color;
                if (haveAllBorders(bs)) {
                    retval.border = bdef;
                } else {
                    if (bs.left) {
                        retval.borderLeft = bdef;
                    }

                    if (bs.top) {
                        retval.borderTop = bdef;
                    }

                    if (bs.rightt) {
                        retval.borderRightt = bdef;
                    }

                    if (bs.bottom) {
                        retval.borderBottom = bdef;
                    }
                }

                if (bs.rounded) {
                    retval.borderRadius = reportSettings.defaultBorderRadius;
                }
            }
        }
    }
    
    return retval;
};

export const getComponentStyle = (reportSettings, currentReport, component) => {
    let unit = currentReport.pageUnits.substring(0, 2);

    switch(component.type) {
        case COMPONENT_TYPE_SHAPE:
            return getShapeComponentStyle(component, unit);
        default:
            return getDefaultComponentStyle(reportSettings, component, unit);
    }
};

export const getComponentClassName = (comp) => {
    if (comp.selected) {
        return "report-component-sel";
    } else {
        return "report-component";
    }
};

export const handleComponentDragStart = (e, componentIndex) => {
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    e.dataTransfer.setData(COMPONENT_DRAG_DATA, JSON.stringify({index: componentIndex, left: x, top: y}));
    e.dataTransfer.effectAllowed = MOVE_DROP_EFFECT;
};

export const handleComponentDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = MOVE_DROP_EFFECT;
};

const isStopPropagationRequired = (component) => {
    return ((component.type === COMPONENT_TYPE_HYPERLINK)
            || (component.type === COMPONENT_TYPE_EMAIL)
            || (component.type === COMPONENT_TYPE_IMAGE));
    };
    
export const onComponentClick = (e, 
    currentReport, 
    setCurrentReport, 
    component, 
    componentIndex, 
    lastSelectedIndex,
    setLastSelectedIndex) => {
    if (e.ctrlKey) {
        e.preventDefault();
        let c = copyObject(component);
        let cr = copyObject(currentReport);
        let sindx = componentIndex;

        // if this was the last selected index and we are deselecting
        // set lastSelectedIndex to -1
        if (c.selected && (componentIndex === lastSelectedIndex)) {
            sindx = -1;
        }

        c.selected = !c.selected;
        cr.reportComponents[componentIndex] = c;
        setCurrentReport(cr);
        setLastSelectedIndex(sindx);
    } else if (isStopPropagationRequired(component)) {
        e.stopPropagation();
    }
};

export const isQueryRequiredForReportObject = (type) => {
    let check = type.toLowerCase();
    return (check.includes("data") || check.includes("chart"));
};
   
export const getReportWidthInPixels = (report, reportSettings) => {
    let size = reportSettings.pageSizeSettings[report.pageSize];
    let units = report.pageUnits;
    if (report.pageOrientation === REPORT_ORIENTATION_LANDSCAPE) {
        if (units === REPORT_UNITS_MM) {
            return size[1] * PIXELS_PER_MM;
        } else {
            return size[3] * PIXELS_PER_INCH;
        }
    } else {
        if (units === REPORT_UNITS_MM) {
            return size[0] * PIXELS_PER_MM;
        } else {
            return size[2] * PIXELS_PER_INCH;
        }
    }
};

export const getReportWidth = (report, reportSettings) => {
    let size = reportSettings.pageSizeSettings[report.pageSize];
    let units = report.pageUnits;
    if (report.pageOrientation === REPORT_ORIENTATION_LANDSCAPE) {
        if (units === REPORT_UNITS_MM) {
            return size[1];
        } else {
            return size[3];
        }
    } else {
        if (units === REPORT_UNITS_MM) {
            return size[0];
        } else {
            return size[2];
        }
    }
};

export const reportUnitsToPixels = (type, size) => {
    if (type) {
        if (type.length > 2) {
            type = type.substring(0, 2);
        }
        
        if (type === REPORT_UNITS_MM) {
            return PIXELS_PER_MM * size;
        } else {
            return PIXELS_PER_INCH * size;
        }
    }
};
    
export const getReportHeightInPixels = (report, reportSettings) => {
    let size = reportSettings.pageSizeSettings[report.pageSize];
    let units = report.pageUnits;

    if (report.pageOrientation === REPORT_ORIENTATION_LANDSCAPE) {
        if (units === REPORT_UNITS_MM) {
            return size[0] * PIXELS_PER_MM;
        } else {
            return size[2] * PIXELS_PER_INCH;
        }
    } else {
        if (units === REPORT_UNITS_MM) {
            return size[1] * PIXELS_PER_MM;
        } else {
            return size[3] * PIXELS_PER_INCH;
        }
    }
};

export const getReportHeight = (report, reportSettings) => {
    let size = reportSettings.pageSizeSettings[report.pageSize];
    let units = report.pageUnits;

    if (report.pageOrientation === REPORT_ORIENTATION_LANDSCAPE) {
        if (units === REPORT_UNITS_MM) {
            return size[0];
        } else {
            return size[2];
        }
    } else {
        if (units === REPORT_UNITS_MM) {
            return size[1];
        } else {
            return size[3];
        }
    }
};

export const LEFT = "left";
export const RIGHT = "right";
export const TOP = "top";
export const BOTTOM = "bottom";
export const CENTER = "center";

export const RULER_WIDTH = 30;
export const RULER_FONT_SIZE = 8;

export const HORIZONTAL_KEY = "hor";
export const VERTICAL_KEY = "ver";


export const getComponentTypeDisplayText = (type) => {
    switch(type) {
        case COMPONENT_TYPE_TEXT:   
            return "Text";
        case COMPONENT_TYPE_IMAGE:   
            return "Image";
        case COMPONENT_TYPE_SHAPE:   
            return "Shape";
        case COMPONENT_TYPE_EMAIL:   
            return "Email";
        case COMPONENT_TYPE_HYPERLINK:   
            return "Hyperlink";
        case COMPONENT_TYPE_PAGENUMBER:   
            return "Page Number";
        case COMPONENT_TYPE_CURRENTDATE:   
            return "Current Date";
        case COMPONENT_TYPE_DATAGRID:   
            return "Data Grid";
        case COMPONENT_TYPE_DATARECORD:   
            return "Data Record";
        case COMPONENT_TYPE_CHART:   
            return "Chart";
        case COMPONENT_TYPE_SUBREPORT:
            return "Sub Report";
     }
};

export const getPageNumberOptions = (valueObject) => {
    return PAGE_NUMBER_FORMATS.map(f => {
        if (valueObject.format === f) {
            return <option value={f} selected>{f.replace("?", "1")}</option>;
        } else {
            return <option value={f}>{f.replace("?", "1")}</option>;
        }
    });
};

export const getCurrentDateFormatOptions = (reportSettings, valueObject) => {
    let dt = moment();
    return reportSettings.defaultDateFormats.map(df => {
        if (valueObject.format === df) {
            return <option value={df} selected>{dt.formatWithJDF(df)}</option>;
        } else {
            return <option value={df}>{dt.formatWithJDF(df)}</option>;
        }
    });
};

