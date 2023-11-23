import {copyObject} from "./helper";

export const COMPONENT_DRAG_DATA = "cinfo";
export const MOVE_DROP_EFFECT = "move";

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
export const PIXELS_PER_POINT = 1.3333;
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


export const COMPONENT_TYPE_TEXT = "text";   
export const COMPONENT_TYPE_IMAGE = "image";  
export const COMPONENT_TYPE_SHAPE = "shape";  
export const COMPONENT_TYPE_EMAIL = "email";   
export const COMPONENT_TYPE_HYPERLINK = "hyperlink";  
export const COMPONENT_TYPE_PAGENUMBER = "pagenumber";  
export const COMPONENT_TYPE_CURRENTDATE = "currentdate";   
export const COMPONENT_TYPE_DATAGRID = "datagrid";  
export const COMPONENT_TYPE_DATAFIELD = "datafield";  
export const COMPONENT_TYPE_DATARECORD = "datarecord";   
export const COMPONENT_TYPE_CHART = "chart";  
export const COMPONENT_TYPE_SUBREPORT = "subreport";
export const MIN_LASSO_CHANGE = 10;

export const SHAPE_HORIZONTAL_LINE = "horizontal line";
export const SHAPE_VERTICAL_LINE = "vertical line";
export const SHAPE_ELLIPSE = "ellipse";
export const SHAPE_ROUNDED_RECTANGLE = "rounded rectangle";
export const SHAPE_RECTANGLE = "rectangle";

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

export const getComponentValue = (reportSettings, component) => {
    let myStyle = {};
    
    switch (component.type) {
        case COMPONENT_TYPE_TEXT:
            return component.value;
        case COMPONENT_TYPE_HYPERLINK:
            if (!component.value.underline) {
                myStyle.textDecoration = "none";
            }
            return <a style={myStyle} href={component.value.url} target="_blank">{component.value.text}</a>;
        case COMPONENT_TYPE_EMAIL:
            if (!component.value.underline) {
                myStyle.textDecoration = "none";
            }
            return <a style={myStyle} href={"mailto:" + component.value.to + (component.value.subject ? "?\nsubject=" + component.value.subject : "")} target="_blank">{component.value.text}</a>;
        case COMPONENT_TYPE_IMAGE:
            if (component.value.sizetofit) {
                myStyle.width = "100%";
                myStyle.height = "100%";
            }
            if (component.value.linkurl) {
                myStyle.cursor = "pointer";
                return <a style={{textDecoration: "none"}} href={component.value.linkurl} target="_blank"><img style={myStyle} alt={component.value.alttext} src={component.value.url} /></a>;
            } else {
                return <img style={myStyle} alt={component.value.alttext} src={component.value.url}/>;
            }
        case COMPONENT_TYPE_SHAPE:
            if ((component.value.shape === SHAPE_HORIZONTAL_LINE)
                    || (component.value.shape === SHAPE_VERTICAL_LINE)) {
                myStyle.backgroundColor = component.value.fillcolor;
                myStyle.position = "absolute";
                
                if (component.value.shape === SHAPE_HORIZONTAL_LINE) {
                    myStyle.width = "100%";
                    myStyle.height = component.value.width + "px";
                    myStyle.top = "50%";
                   return <div style={myStyle} />;
                } else {
                    myStyle.width = component.value.width + "px";
                    myStyle.height = "100%";
                    myStyle.marginLeft = "50%" ;
                    return <div style={myStyle} />;
                }
            } else {
                myStyle.height = "100%";
                myStyle.width = "100%";
                
                if (!component.value.border 
                    || (component.value.border === "none")) {
                    myStyle.border = "none";
                } else {
                    myStyle.border = component.value.border + " " + component.value.width + "px " + component.value.bordercolor;
                }
                 
                if (component.value.filled) {
                    myStyle.background = component.value.fillcolor;
                } else {
                    myStyle.background = "transparent";
                }

                switch (component.value.shape) {
                    case SHAPE_ELLIPSE:
                        myStyle.borderRadius = "50%";
                        break;
                    case SHAPE_ROUNDED_RECTANGLE:
                        myStyle.borderRadius = reportSettings.defaultBorderRadius;
                        break;
                }

                 return <div style={myStyle} />;
            }

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
    return (bs.left || bs.top && bs.right || bs.bottom);
};

export const getBorderStyleOptions = (reportSettings, bs) => {
    return reportSettings.borderStyles.map(b => {
        if (bs.border === b) {
            return <option value={b} selected>{b}</option>;
        } else {
            return <option value={b}>{b}</option>;
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

export const getComponentStyle = (reportSettings, currentReport, component) => {
    let unit = currentReport.pageUnits.substring(0, 2);

    let retval = {
        width: component.width + unit,
        height: component.height + unit,
        top: component.top + unit,
        left: component.left + unit,
        cursor: "pointer",
        textAlign: component.align,
        color: component.foregroundColor,
        backgroundColor: component.backgroundColor,
        zIndex: component.zindex
    };

    if (component.fontSettings) {
        let fs = component.fontSettings;
        retval.fontFamilty = fs.font;
        retval.fontSize = fs.size + "pt";
        if (fs.italic) {
            retval.fontStyle = "italic";
        }

        if (fs.bold) {
            retval.fontWeight = 700;
        }

        if (fs.underline) {
            retval.textDecoration = "underline";
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

    return retval;
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
    
export const onComponentClick = (e, currentReport, setCurrentReport, component, componentIndex, lastSelectedIndex) => {
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
        case COMPONENT_TYPE_DATAFIELD:   
            return "Data Field";
        case COMPONENT_TYPE_DATARECORD:   
            return "Data Record";
        case COMPONENT_TYPE_CHART:   
            return "Chart";
        case COMPONENT_TYPE_SUBREPORT:
            return "Sub Report";
     }
};

export const TEXT_ALIGN_OPTIONS = ["left", "center", "right"];
export const BOLD_FONT_WEIGHT = 700;
export const STANDARD_FONT_WEIGHT = 400;