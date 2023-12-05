import {copyObject} from "./helper";
import moment from "moment";
import javadatefp from "moment-jdateformatparser";
import SubComponent from "../pages/reportdesign/SubComponent";
import GridSizer from "../widgets/GridSizer";

import {
    NONE_SETTING,
    TRANSPARENT_SETTING, 
    ITALIC_SETTING, 
    UNDERLINE_SETTING,
    LABEL_TYPE,
    DATA_TYPE,
    isNotEmpty
} from "./helper";

export const COMPONENT_DRAG_DATA = "cinfo";
export const SUBCOMPONENT_DRAG_DATA = "scinfo";
export const MOVE_DROP_EFFECT = "move";
export const OPACITY_OPTIONS = [1, 0.75, 0.5, 0.25];
export const DEFAULT_BORDER_RADIUS = "10px";
 
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

export const RESIZER_ID_PREFIX = "sz-";
export const TABULAR_LAYOUT = "tabular";


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
export const DATA_COLUMN_ID_PREFIX = "dc-";
export const COMPONENT_ID_PREFIX = "rc-";
export const COMPONENT_TYPE_TEXT = "text";   
export const COMPONENT_TYPE_IMAGE = "image";  
export const COMPONENT_TYPE_SHAPE = "shape";  
export const COMPONENT_TYPE_EMAIL = "email";   
export const COMPONENT_TYPE_HYPERLINK = "hyperlink";  
export const COMPONENT_TYPE_PAGENUMBER = "pagenumber";  
export const COMPONENT_TYPE_CURRENTDATE = "currentdate";   
export const COMPONENT_TYPE_DATAFIELD = "datafield";  
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
export const GRID_LAYOUT_TABULAR = "tabular";
export const GRID_LAYOUT_FREEFORM = "freeform";
export const GRID_LAYOUT_OPTIONS = [GRID_LAYOUT_TABULAR, GRID_LAYOUT_FREEFORM];

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

export const elementPosToNumber = (pos) => {
    if (pos && pos.replace) {
        return Number(pos.replace("px", "").replace("in", "").replace("mm", ""));
    } else {
        return pos;
    }
};

export const getSizer = (id) => {
   return document.getElementById(RESIZER_ID_PREFIX + id);
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

export const updateComponentFontSettings = (component, fsame, myStyle) => {
    myStyle.fontFamily = component[fsame].font;
    myStyle.fontSize = component[fsame].size + "pt";
    myStyle.color = component[fsame].color;
    myStyle.backgroundColor = component[fsame].backgroundColor;
        
    
    if (component[fsame].bold) {
        myStyle.fontWeight = BOLD_FONT_WEIGHT;
    }

    if (component[fsame].italic) {
        myStyle.fontStyle = ITALIC_SETTING;
    }

    if (component[fsame].underline) {
        myStyle.textDecoration = UNDERLINE_SETTING;
    }
 };  

export const updateComponentBorderSettings = (component, bsname, myStyle) => {
    let bs = component[bsname];
    let bdef = bs.border + " " + bs.width + "px " + bs.color;
    if (haveAllBorders(bs)) {
        myStyle.border = bdef;
    } else {
        if (bs.left) {
            myStyle.borderLeft = bdef;
        }

        if (bs.top) {
            myStyle.borderTop = bdef;
        }

        if (bs.right) {
            myStyle.borderRight = bdef;
        }

        if (bs.bottom) {
            myStyle.borderBottom = bdef;
        }
    }

    if (bs.rounded) {
        myStyle.borderRadius = DEFAULT_BORDER_RADIUS;
    }
};
    
const getGridTabularHeaderStyle = (currentReport, component) => {
     let retval = {
        overflow: "hidden",
        height: component.value.headerRowHeight + currentReport.pageUnits.substring(0, 2)
    };
    
    updateComponentFontSettings(component, "fontSettings", retval);
    updateComponentBorderSettings(component, "borderSettings", retval);
    
    return retval;
};

const getGridTabularDataStyle = (currentReport, component) => {
    let retval = {
        overflow: "hidden",
        height: component.value.dataRowHeight + currentReport.pageUnits.substring(0, 2)
    };
    
    updateComponentFontSettings(component, "fontSettings2", retval);
    updateComponentBorderSettings(component, "borderSettings2", retval);
    
    return retval;
};

const getGridComponentTabularStyle = (component) => {
    let retval = {
        display: "grid",
        gridTemplateColumns: component.value.gridTemplateColumns,
        margin: 0,
        padding:0,
        gridRowGap: 0
    };
    
    return retval;
};
    
const getDataRecordComponentStyle = (component) => {
    let retval = {
        display: "grid",
        gridTemplateColumns: component.value.gridTemplateColumns,
        margin: 0,
        padding: (component.value.rowGap/2) + "px 0 " + (component.value.rowGap/2) + "px 0",
        gridRowGap: 0
    };
    
    return retval;
};

const getGridTabularHeader = (currentReport, component, componentIndex, myStyle) => {
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
            <GridSizer type="width" row="header" column={indx} component={component} componentIndex={componentIndex}/>
            <GridSizer type="height" row="header" column={indx} component={component}  componentIndex={componentIndex}/>
        </div>;
    });
};

const isLastDataColumn = (dataColumns, indx) => {
    return (indx === (dataColumns.length - 1));
};

const getGridTabularExampleData = (currentReport, component) => {
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
    
const getGridTabularData = (currentReport, component, componentIndex, exampleData, myStyle) => {
    let styles = [];
    let styles2;
    component.value.dataColumns.map((d) => {
        let s = {...myStyle};
        let ta = d.dataTextAlign;
        
        if (!ta) {
            ta = DEFAULT_DATA_TEXT_ALIGN;
        }

        s.textAlign = ta;
    
        styles.push(s);
        if (component.value.altrowcolor) {
            if (!styles2) {
                styles2 = [];
            }
            
            styles2.push({...s, backgroundColor: component.value.altrowcolor});
        }
    });
    
    return exampleData.map((r, indx1) => {
        let rowStyles = styles;
        
        if ((((indx1 + 1) % 2) === 0) && styles2) {
            rowStyles = styles2;
        }
        
        return r.map((c, indx2) => {
            if (indx1 === 0) {
                return <div style={rowStyles[indx2]}>{c}
                    <GridSizer type="height" row="data" column={indx2} component={component} componentIndex={componentIndex}/>
                </div>;
           } else {
                return <div style={rowStyles[indx2]}>{c}</div>;
           }   
        });
    });
};
    
const getGridSubComponents = (currentReport, component, type) => {
    return component.value.dataColumns.map((dc, indx) => {
        return <SubComponent component={component} dataColumn={dc} dataColumnIndex={indx} type={type} units={currentReport.pageUnits.substring(0, 2)}/>;
    });
};
    
const getDataGridComponentValue = (currentReport, component, componentIndex) => {
    if (component.value.gridLayout === GRID_LAYOUT_TABULAR) {
        let headerStyle = getGridTabularHeaderStyle(currentReport, component);
        let dataStyle = getGridTabularDataStyle(currentReport, component);
        return <div style={getGridComponentTabularStyle(component)}>
            {getGridTabularHeader(currentReport, component, componentIndex, headerStyle)}
            {getGridTabularData(currentReport, component, componentIndex, getGridTabularExampleData(currentReport, component), dataStyle)}
         </div>;
    } else {
        return <div>
           {getGridSubComponents(currentReport, component, LABEL_TYPE)}
           {getGridSubComponents(currentReport, component, DATA_TYPE)}
        </div>;
    }
};

const getDataComponentLabelStyle = (component) => {
     let retval = {
    };
    
    updateComponentFontSettings(component, "fontSettings", retval);
    updateComponentBorderSettings(component, "borderSettings", retval);
    
    return retval;
};

const getDataComponentDataStyle = (component) => {
     let retval = {
        paddingLeft: "5px"
        
    };
    
    updateComponentFontSettings(component, "fontSettings2", retval);
    updateComponentBorderSettings(component, "borderSettings2", retval);
    return retval;
};

const getDataRecordComponentValue = (component) => {
    let labelStyle = getDataComponentLabelStyle(component);
    let dataStyle = getDataComponentDataStyle(component);
    let labelStyles = [];
    let dataStyles = [];
    
    component.value.dataColumns.map(d => {
        let ta = d.headerTextAlign;
        if (!ta) {
            ta = "right";
        }
        
        let s = {...labelStyle};
        s.textAlign = ta;
        labelStyles.push(s);

        ta = d.dataTextAlign;
        if (!ta) {
            ta = "left";
        }
        
        s = {...dataStyle};
        s.textAlign = ta;
        dataStyles.push(s);
    });
    
    let gridStyle = getDataRecordComponentStyle(component);
    return component.value.dataColumns.map((d, indx) => {
        return <div style={gridStyle}>
            <div style={labelStyles[indx]}>{d.displayName}</div>
            <div style={dataStyles[indx]}>{getQueryDataColumnDisplay(d)}</div>
        </div>;  
    });
};

export const getQueryDataColumnDisplay = (dc) => {
    if (dc.customSql) {
        return dc.customSql;
    } else if (dc.aggregateFunction) {
        return dc.aggregateFunction + "(" + dc.tableAlias + "." + dc.columnName + ")";
    } else {
        return dc.tableAlias + "." + dc.columnName;
    }
};
    
export const getComponentValue = (reportSettings, currentReport, component, componentIndex, forExample) => {
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
            return getDataGridComponentValue(currentReport, component, componentIndex);
        case COMPONENT_TYPE_DATARECORD:
           return getDataRecordComponentValue(component);
        case COMPONENT_TYPE_DATAFIELD:
           return getQueryDataColumnDisplay(component.value.dataColumns[0]);
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
    let gtc = "";
    let unit = currentReport.pageUnits.substring(0, 2);
    if (component.type === COMPONENT_TYPE_DATAGRID) {
        let numcols = component.value.dataColumns.length;
        if (component.value.gridLayout === GRID_LAYOUT_TABULAR) {
            let cwidth = component.width / numcols;

            for (let i = 0; i < numcols; ++i) {
                gtc += (cwidth + unit + " ");
            }
        
            component.value.gridTemplateColumns = gtc.trim();
        } else {
            // new setup - set the sizes
            if (component.value.dataColumns
                && (component.value.dataColumns.length > 0)
                && !component.value.dataColumns[0].labelWidth
                && !component.value.dataColumns[0].dataWidth) {
                for (let i = 0; i < component.value.dataColumns.length; ++i) {
                    component.value.dataColumns[i].labelLeft = pixelsToReportUnits(unit, (5 * i));
                    component.value.dataColumns[i].dataLeft = pixelsToReportUnits(unit, (5 * i) + 100);

                    component.value.dataColumns[i].labelTop = pixelsToReportUnits(unit, (((PIXELS_PER_POINT * component.fontSettings.size)/2) * i));
                    component.value.dataColumns[i].dataTop = pixelsToReportUnits(unit, (((PIXELS_PER_POINT * component.fontSettings2.size)/2) * (i + 1.5)));

                    let haveLabel = isNotEmpty(component.value.dataColumns[i].displayName);

                    if (unit === REPORT_UNITS_MM) {
                        component.value.dataColumns[i].labelWidth = haveLabel ? 30 : 0;
                        component.value.dataColumns[i].dataWidth = 30;
                    } else {
                        component.value.dataColumns[i].labelWidth = haveLabel ? 1 : 0;
                        component.value.dataColumns[i].dataWidth = 1;
                    }

                    component.value.dataColumns[i].labelHeight = haveLabel ? pixelsToReportUnits(unit, PIXELS_PER_POINT * component.fontSettings.size) : 0;
                    component.value.dataColumns[i].dataHeight = pixelsToReportUnits(unit, PIXELS_PER_POINT * component.fontSettings2.size);
                }
            }
        }
     } else {
        if (!component.value.gridTemplateColumns) {
            let maxWidth = 0;
            for (let i = 0; i < component.value.dataColumns.length; ++i) {
                let w = (((PIXELS_PER_POINT/2) * component.fontSettings.size) * component.value.dataColumns[i].displayName.length);
                if (w > maxWidth) {
                    maxWidth = w;
                }
            }

            let labelWidth = pixelsToReportUnits(unit, maxWidth);
            component.width = 2 * labelWidth;
            component.height = component.value.dataColumns.length 
                * pixelsToReportUnits(unit, (PIXELS_PER_POINT * component.fontSettings.size) + 5 + (component.value.rowGap ? Number(component.value.rowGap) : 0));
            gtc = labelWidth + unit + " " + labelWidth + unit;
        } else {
            gtc = component.value.gridTemplateColumns;
        }
        
        component.value.gridTemplateColumns = gtc.trim();
    }
    
};

export const isDataComponent = (type) => {
    return ((type === COMPONENT_TYPE_DATAGRID) 
        || (type === COMPONENT_TYPE_DATARECORD)
        || (type === COMPONENT_TYPE_DATAFIELD));
};

export const isDataGridComponent = (type) => {
    return (type === COMPONENT_TYPE_DATAGRID);
};

export const isTabularDataGridComponent = (component) => {
    if (isDataGridComponent(component.type)) {
        return (component.value && (component.value.gridLayout === TABULAR_LAYOUT));
    } 
    
    return false;
};

export const getDefaultComponentStyle = (component, unit) => {
    let retval = {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
            cursor: "pointer",
            textAlign: component.align,
            zIndex: component.zindex
        };
    
    if ((component.type !== COMPONENT_TYPE_DATAGRID)
        && (component.type !== COMPONENT_TYPE_DATARECORD)){
        if (component.fontSettings) {
            updateComponentFontSettings(component, "fontSettings", retval);
        }

        if (component.borderSettings) {
            if (haveBorder(component.borderSettings)) {
                updateComponentBorderSettings(component, "borderSettings", retval);
            }
        }
    }
    
    return retval;
};

export const getComponentStyle = (currentReport, component) => {
    let unit = currentReport.pageUnits.substring(0, 2);

    switch(component.type) {
        case COMPONENT_TYPE_SHAPE:
            return getShapeComponentStyle(component, unit);
        default:
            return getDefaultComponentStyle(component, unit);
    }
};

export const getComponentClassName = (comp) => {
    if (comp.selected) {
        return "report-component-sel";
    } else {
        return "report-component";
    }
};

export const getSubComponentClassName = (subcomp, type) => {
    if (subcomp[type + "Selected"]) {
        return "report-component-sel";
    } else {
        return "report-component";
    }
};

export const handleComponentDragStart = (e, type, componentIndex, additionalInfo) => {
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    e.dataTransfer.setData(type, JSON.stringify({index: componentIndex, left: x, top: y, additionalInfo: additionalInfo}));
    e.dataTransfer.effectAllowed = MOVE_DROP_EFFECT;
};

export const handleComponentDragOver = (e) => {
    e.preventDefault();
    
    let subtype = SUBCOMPONENT_DRAG_DATA + "-" + e.target.id;
    // if this is the current cubcomponent parent
    if (e.target.id 
        && (e.target.id.startsWith(DATA_COLUMN_ID_PREFIX) 
            || e.dataTransfer.types.includes(subtype))) {
         e.dataTransfer.dropEffect = MOVE_DROP_EFFECT;
    } else {
        // only allow component drag if not
        // subcomponent drag (subcompoent data in types)
        if (e.dataTransfer.types.findIndex((type) => type.startsWith(SUBCOMPONENT_DRAG_DATA)) < 0) {
            e.dataTransfer.dropEffect = MOVE_DROP_EFFECT;
        } else {
            e.dataTransfer.dropEffect = NONE_SETTING;
        }
    }
};

const isStopPropagationRequired = (component) => {
    return ((component.type === COMPONENT_TYPE_HYPERLINK)
            || (component.type === COMPONENT_TYPE_EMAIL)
            || (component.type === COMPONENT_TYPE_IMAGE));
    };
    
export const onComponentClick = (e, 
    currentReport, 
    setCurrentReport, 
    componentIndex, 
    lastSelectedIndex, 
    setLastSelectedIndex,
    lastSelectedSubIndex, 
    setLastSelectedSubIndex,
    deselectAllSubComponents,
    componentHasSelectedSubComponents) => {

    let curc = currentReport.reportComponents[componentIndex];

    if (e.ctrlKey) {
        e.preventDefault();
        let cr = copyObject(currentReport);
        let c = cr.reportComponents[componentIndex];
        let sindx = componentIndex;
        // if this was the last selected index and we are deselecting
        // set lastSelectedIndex to -1
        if (c.selected && (componentIndex === lastSelectedIndex)) {
            sindx = -1;
        }

        if (e.target.id.startsWith(DATA_COLUMN_ID_PREFIX)) {
            let parts = e.target.id.split("-");
            let dcindx = Number(parts[3]);
            let sc = c.value.dataColumns[dcindx];
            sc[parts[4] + "Selected"] = !sc[parts[4] + "Selected"];
            
            if (sc[parts[4] + "Selected"]) {
                setLastSelectedSubIndex(dcindx);
                cr.reportComponents.map(curc => (curc.selected = false));
            } 
            
            // if we are selecting sub component
            // clear any selected components
            cr.reportComponents.map(c => (c.selected = false));
        } else {
            c.selected = !c.selected;
           if (c.selected && componentHasSelectedSubComponents(c)) {
                deselectAllSubComponents(c);
            }
            setLastSelectedIndex(sindx);
        }
        setCurrentReport(cr);
    } else if (isStopPropagationRequired(curc)) {
        e.stopPropagation();
    }
 };

export const isQueryRequiredForReportObject = (type) => {
    let check = type.toLowerCase();
    return (check.includes(DATA_TYPE) || check.includes("chart"));
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
        case COMPONENT_TYPE_DATAFIELD:   
            return "Data Field";
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

