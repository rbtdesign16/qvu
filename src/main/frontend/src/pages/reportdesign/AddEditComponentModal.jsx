import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import { MdHelpOutline } from "react-icons/md";
import {AiOutlineCaretDown, AiOutlineCaretUp} from "react-icons/ai";
import { Tabs, Tab } from "react-bootstrap";
import NumberEntry from "../../widgets/NumberEntry";
import BorderPanel from "../../widgets/BorderPanel";
import FontPanel from "../../widgets/FontPanel";
import PropTypes from "prop-types";
import ColorPicker from "../../widgets/ColorPicker"
import useReportDesign from "../../context/ReportDesignContext";
import {MODAL_TITLE_SIZE, 
    copyObject,
    getUUID,
    COLOR_BLACK,
    NONE_SETTING,
    TRANSPARENT_SETTING,
    UNDERLINE_SETTING,
    SMALL_ICON_SIZE,
    replaceTokens,
    getColumnHelpDisplay,
    formatPathForDisplay,
    isDataTypeInt,
    isDataTypeFloat,
    isDataTypeNumeric,
    isDataTypeDateTime,
    WIDTH_TYPE} from "../../utils/helper";
import {
    COMPONENT_TYPE_TEXT,  
    COMPONENT_TYPE_IMAGE, 
    COMPONENT_TYPE_SHAPE,
    COMPONENT_TYPE_EMAIL, 
    COMPONENT_TYPE_HYPERLINK,
    COMPONENT_TYPE_PAGENUMBER,
    COMPONENT_TYPE_CURRENTDATE,
    COMPONENT_TYPE_DATAFIELD,
    COMPONENT_TYPE_DATAGRID,
    COMPONENT_TYPE_DATARECORD,
    COMPONENT_TYPE_CHART,
    COMPONENT_TYPE_SUBREPORT,
    pixelsToReportUnits, 
    TEXT_ALIGN_OPTIONS,
    SHAPE_VERTICAL_LINE,
    SHAPE_HORIZONTAL_LINE,
    getComponentTypeDisplayText,
    getBorderStyleOptions, 
    getBorderWidthOptions,
    getShapeOptions,
    getOpacityOptions,
    getComponentValue,
    BORDER_STYLE_SOLID,
    DEFAULT_PAGE_NUMBER_FORMAT,
    DEFAULT_CURRENT_DATE_FORMAT,
    getPageNumberOptions,
    getCurrentDateFormatOptions,
    isDataComponent,
    reformatDataComponent,
    getQueryDataColumnDisplay,
    DEFAULT_DATA_TEXT_ALIGN,
    GRID_LAYOUT_OPTIONS,
    COMPONENT_ID_PREFIX,
    FREEFORM_LAYOUT,
    isTabularDataGridComponent} from "../../utils/reportHelper";

const AddEditComponentModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const [typeDisplay, setTypeDisplay] = useState("");
    const {currentReport, 
        reportSettings, 
        currentComponent, 
        setCurrentComponent,
        currentQuery,
        setCurrentQuery,
        getNewBorderSettings} = useReportDesign();
 
    const [selectColumns, setSelectColumns] = useState([]);
    const [dataColumnCount, setDataColumnCount] = useState(0);
    
    const getQueryColumnHelpText = (sc) => {
        return getColumnHelpDisplay(sc, getText);
    };

    const getTitle = () => {
        if (currentComponent) {
            if (config.edit) {
                return replaceTokens(getText("Edit Component"), typeDisplay);
            } else {
                return replaceTokens(getText("Add Component"), typeDisplay);
            }
        } else {
            return "";
        }
    };

    const onHide = () => {
        config.hide();
    };

    const getQueryColumnKey = (c) => {
        return ((c.customSql ? c.customSql : "")
            + (c.aggregateFunction ? c.aggregateFunction : "")
            + c.path);
    };
    
    const onShow = () => {
        setTypeDisplay(getText(getComponentTypeDisplayText(currentComponent.type)));
        
        if (currentQuery && isDataComponent(currentComponent.type)) {
            if ((currentComponent.type === COMPONENT_TYPE_DATAGRID) 
                || (currentComponent.type === COMPONENT_TYPE_DATARECORD)) {
                let cset = new Set();

                if (currentComponent.value.dataColumns) {
                    currentComponent.value.dataColumns.map(d => cset.add(getQueryColumnKey(d)));
                }

                let scols = copyObject(currentComponent.value.dataColumns);

                currentQuery.selectColumns.map((sc, indx) => {
                    if (!cset.has(getQueryColumnKey(sc)) && sc.showInResults) {
                        let c = copyObject(sc);
                        if (currentComponent.type === COMPONENT_TYPE_DATARECORD) {
                            c.headerTextAlign = "right";
                            c.dataTextAlign = "left";
                        } else {
                            c.headerTextAlign = "center";
                            c.dataTextAlign = "center";
                        }

                        c.selectIndex = indx;
                        scols.push(c);
                    }
                });


                if (currentComponent.type === COMPONENT_TYPE_DATARECORD) {
                    let el = document.getElementById("rgne");
                            
                    if (el) {
                        el.value = currentComponent.value.rowGap ? currentComponent.value.rowGap : 0;
                    }
                }
                
                if (currentComponent.value.dataColumns) {
                    setDataColumnCount(currentComponent.value.dataColumns.length);
                } else {
                    setDataColumnCount(0);
                }

                setSelectColumns(scols);
            } else {
                if (currentComponent.value.dataColumns.length === 0) {
                    let c = copyObject(currentComponent);
                    let sc = copyObject(currentQuery.selectColumns[0]);
                    sc.selectColumnIndex = 0;
                    c.value.dataColumns.push(sc);
                    c.value.textAlign = DEFAULT_DATA_TEXT_ALIGN;
                    setCurrentComponent(c);
                }
            }
        } else {
            setSelectColumns(null);
        }
    };

    const setColorValue = (color, name) => {
        let c = {...currentComponent};
        c.value[name] = color;
        setCurrentComponent(c);
    };

    const setValue = (e) => {
        let c = {...currentComponent};
        switch (currentComponent.type) {
            case COMPONENT_TYPE_TEXT:
                c.value = e.target.value;
                break;
            case COMPONENT_TYPE_IMAGE:
                if (e.target.name === "sizetofit") {
                    c.value[e.target.name] = e.target.checked;
                } else {
                    c.value[e.target.name] = e.target.value;
                }
                break;
            case COMPONENT_TYPE_EMAIL:
            case COMPONENT_TYPE_HYPERLINK:
                if (e.target.name === UNDERLINE_SETTING) {
                    c.value[e.target.name] = e.target.checked;
                } else {
                    c.value[e.target.name] = e.target.value;
                }
                break;
            case COMPONENT_TYPE_SHAPE:
                if ((e.target.name === "wantfilled") 
                    || (e.target.name === "wantborder")) {
                    c.value[e.target.name] = e.target.checked;
                } else if (e.target.options) {
                    c.value[e.target.name] = e.target.options[e.target.selectedIndex].value;
                } else {
                    c.value[e.target.name] = e.target.value;
                }
                break;
            case COMPONENT_TYPE_CURRENTDATE:
            case COMPONENT_TYPE_PAGENUMBER:
                c.value[e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case COMPONENT_TYPE_DATAGRID:
                if (e.target.options) {
                    c.value[e.target.name] = e.target.options[e.target.selectedIndex].value;
                }
                break;
            case COMPONENT_TYPE_DATARECORD:
                c.value[e.target.name] = Number(e.target.value);
                break;
            case COMPONENT_TYPE_DATAFIELD:
                if (e.target.name === "selectColumnIndex") {
                    let sc = currentQuery.selectColumns[e.target.selectedIndex];
                    sc.selectColumnIndex = e.target.selectedIndex;
                    c.value.dataColumns = [sc];
                } else if (e.target.name === "displayFormat") {
                   c.value.dataColumns[0].displayFormat = e.target.options[e.target.selectedIndex].value;
                }
                break;
        }
        
        setCurrentComponent(c);
     };

    const loadTextAlignOptions = () => {
         return TEXT_ALIGN_OPTIONS.map(ta => {
             if (ta === currentComponent.align) {
                 return <option value={ta} selected>{getText(ta)}</option>;
             } else {
                 return <option value={ta}>{getText(ta)}</option>;
             }
         });
    };

    const loadQueryColumnTextAlignOptions = (sc, name) => {
         return TEXT_ALIGN_OPTIONS.map(ta => {
             if (ta === sc[name]) {
                 return <option value={ta} selected>{getText(ta)}</option>;
             } else {
                 return <option value={ta}>{getText(ta)}</option>;
             }
         });
    };

    const moveSelectColumnUp = (indx) => {
        let sc = copyObject(selectColumns);
        let item = sc[indx];
        sc.splice(indx, 1);
        sc.splice(indx - 1, 0, item);
        setSelectColumns(sc);
    };

    const moveSelectColumnDown = (indx) => {
        let sc = copyObject(selectColumns);
        let item = sc[indx + 1];
        sc.splice(indx + 1, 1);
        sc.splice(indx, 0, item);
        setSelectColumns(sc);
    };

    const setTextAlign = (e) => {
        let c = {...currentComponent};
        c.align = e.target.options[e.target.selectedIndex].value;
        setCurrentComponent(c);
    };
    
    const getTextEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("Text:")}</div>
            <div><textarea cols={40} rows={2} onChange={e => setValue(e)} value={currentComponent.value}/></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
        </div>;
    };
    
    const getHyperlinkEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("URL:")}</div><div><input type="text" name="url" size={40} onChange={e => setValue(e)} value={currentComponent.value.url}/></div>
            <div className="label">{getText("Display Text:")}</div><div><input name="text" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.text}/></div>
            <div></div><div><input key={getUUID()} name={UNDERLINE_SETTING} type="checkbox" checked={currentComponent.value.underline} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="textdecor">{getText("Underline")}</label></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
        </div>;
    };
    
    const getEmailEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("To:")}</div><div><input name="to" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.to}/></div>
            <div className="label">{getText("Subject:")}</div><div><input type="text" name="subject" size={40} onChange={e => setValue(e)} value={currentComponent.value.subject}/></div>
            <div className="label">{getText("Display Text:")}</div><div><input name="text" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.text}/></div>
            <div></div><div><input key={getUUID()} name={UNDERLINE_SETTING} type="checkbox" checked={currentComponent.value.underline} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="textdecor">{getText("Underline")}</label></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
        </div>;
    };

    const getImageEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("URL:")}</div><div><input type="text" name="url" size={40} onChange={e => setValue(e)} value={currentComponent.value.url}/></div>
            <div className="label">{getText("Alt Text:")}</div><div><input name="alttext" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.alttext}/></div>
            <div className="label">{getText("Link URL:")}</div><div><input name="linkurl" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.linkurl}/></div>
            <div></div><div><input key={getUUID()} name="sizetofit" type="checkbox" checked={currentComponent.value.sizetofit} onChange={e => setValue(e)} value={currentComponent.value.sizetofit}/><label className="ck-label" htmlFor="sizrtofit">{getText("Size to Fit")}</label></div>
        </div>;
    };
    
    const isShapeLine = () => {
        return ((currentComponent.type === (COMPONENT_TYPE_SHAPE) 
            && (currentComponent.value.shape === SHAPE_VERTICAL_LINE) 
                || (currentComponent.value.shape === SHAPE_HORIZONTAL_LINE)));
    };
        
    const getShapeEntry = () => {
        if (!currentComponent.value.width) {
            currentComponent.value.width = 1;
        }
        
        if (!isShapeLine()) {
            if (!currentComponent.value.border) {
                currentComponent.value.border = BORDER_STYLE_SOLID;
            }
            
            if (!currentComponent.value.bordercolor) {
                currentComponent.value.bordercolor = COLOR_BLACK;
            }
 
            if (!currentComponent.value.wantfilled || !currentComponent.value.fillcolor) {
                currentComponent.value.fillcolor = TRANSPARENT_SETTING;
            }

            return <div>
                <div className="entrygrid-125-125">
                    <div className="label">{getText("Shape:")}</div><div><select name="shape" onChange={e => setValue(e)}>{getShapeOptions(reportSettings, currentComponent.value)}</select></div>
                    <div className="label">{getText("Opacity:")}</div><div><select name="opacity" onChange={e => setValue(e)}>{getOpacityOptions(currentComponent.value)}</select></div>
                </div>
                <div className="tb-border">{getText("Border:")}</div>    
                <div className="entrygrid-125-125">
                    <div></div><div><input key={getUUID()} name="wantborder" type="checkbox" checked={currentComponent.value.wantborder} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="left">{getText("Show")}</label></div>
                    <div className="label">{getText("Style:")}</div>
                    <div><select name="border" onChange={e => setValue(e)}>{getBorderStyleOptions(reportSettings, currentComponent.value, true)}</select></div>
                    <div className="label">{getText("Width:")}</div>
                    <div><select name={WIDTH_TYPE} onChange={e => setValue(e)}>{getBorderWidthOptions(reportSettings, currentComponent.value)}</select> </div>
                    <div className="label">{getText("Color")}</div>
                    <div><ColorPicker name="bordercolor" color={currentComponent.value.bordercolor} setColor={setColorValue}/> </div>                  
                </div>        
                <div className="tb-border">{getText("Fill:")}</div>    
                <div className="entrygrid-125-125">
                    <div></div><div><input key={getUUID()} name="wantfilled" type="checkbox" checked={currentComponent.value.wantfilled} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="left">{getText("Filled")}</label></div>
                    <div className="label">{getText("Color:")}</div>     
                    <div><ColorPicker name="fillcolor" color={currentComponent.value.fillcolor} setColor={setColorValue}/></div>
                </div>    
                <div className="tb-border">{getText("Example:")}</div>    
                <div className="ta-center w-100"><div className="shape-example">{getComponentValue(reportSettings, currentReport, currentComponent, -1)}</div></div>
            </div>;
        } else {
           if (!currentComponent.value.fillcolor) {
                currentComponent.value.fillcolor = COLOR_BLACK;
            }
           
            if (!currentComponent.value.width) {
                currentComponent.value.width = 2;
            }
            
            return <div>
                    <div className="entrygrid-125-125">
                        <div className="label">{getText("Shape:")}</div><div><select name="shape" onChange={e => setValue(e)}>{getShapeOptions(reportSettings, currentComponent.value)}</select></div>
                    </div>
                    <div className="tb-border">{getText("Line:")}</div>    
                    <div className="entrygrid-125-125">
                        <div className="label">{getText("Width:")}</div><div><select name={WIDTH_TYPE} onChange={e => setValue(e)}>{getBorderWidthOptions(reportSettings, currentComponent.value)}</select></div>
                        <div className="label">{getText("Color:")}</div><div><ColorPicker name="fillcolor" color={currentComponent.value.fillcolor} setColor={setColorValue}/></div>
                    </div>
                    <div className="tb-border">{getText("Example:")}</div>    
                    <div className="ta-center w-100"><div className="shape-example">{getComponentValue(reportSettings, currentReport, currentComponent, -1, true)}</div></div>
                </div>;
         }
    };

    const getCurrentDateEntry = () => {
       if (!currentComponent.value.format) {
            currentComponent.value.format = DEFAULT_CURRENT_DATE_FORMAT;
        }
        return <div className="entrygrid-125-125">
            <div className="label">{getText("Format:")}</div><div><select name="displayFormat" onChange={e => setValue(e)}>{getCurrentDateFormatOptions(reportSettings, currentComponent.value)}</select></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
        </div>;
    };
            
    const getPageNumberEntry = () => {
        if (!currentComponent.value.format) {
            currentComponent.value.format = DEFAULT_PAGE_NUMBER_FORMAT;
        }
        
        return <div className="entrygrid-125-125">
            <div className="label">{getText("Format:")}</div><div><select name="displayFormat" onChange={e => setValue(e)}>{getPageNumberOptions(currentComponent.value)}</select></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
        </div>;
    };
    
    const getHeaderTitle = (sc) => {
        return getText("Table Alias:", " ") + sc.tableAlias + "\n" + getText("Path:", " ") + formatPathForDisplay(sc.path);
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain",e.target.id.replace("scol-", ""));
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e) => {
        let el = document.elementFromPoint(e.clientX, e.clientY);
         if (el && el.id && el.id.startsWith("scol-")) {
            let dindx = Number(el.id.replace("scol-", ""));
            let sindx = Number(e.dataTransfer.getData("text/plain"));
           if (sindx !== dindx) {
                let sc = copyObject(selectColumns);
                let col = sc[sindx];
                sc.splice(sindx, 1);
                sc.splice(dindx, 0, col);
                setSelectColumns(sc);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const setQueryValue = (e, indx) => {
        let c = copyObject(selectColumns);
        switch(e.target.name) {
            case "selected":
                c[indx].selected = e.target.checked;
                if (!e.target.checked && c[indx].addTotal) {
                    c[indx].addTotal = false;
                }
                break;
            case "addTotal":
                c[indx].addTotal = e.target.checked;
                if (e.target.checked) {
                    c[indx].selected = true;
                }
                break;
            case "displayName":
                c[indx].displayName = e.target.value;
                break;
           case FORMAT_SETTING:
                c[indx].displayFormat = e.target.options[e.target.selectedIndex].value;
                break;
           case "headerTextAlign":
                c[indx].headerTextAlign = e.target.options[e.target.selectedIndex].value;
                break;
           case "dataTextAlign":
                c[indx].dataTextAlign = e.target.options[e.target.selectedIndex].value;
                break;
        }
        
        setSelectColumns(c);
    };
    
    const isColumnFormatAvailable = (sc) => {
        return (isDataTypeNumeric(sc.dataType) || isDataTypeDateTime(sc.dataType));
    };
    
    const getQueryColumnFormatOptions = (sc) => {
        if (isDataTypeDateTime(sc.dataType)) {
            return reportSettings.defaultDateFormats.map(f => {
                if (f === sc.displayFormat) {
                    return <option value={f} selected>{f}</option>;
                } else {        
                    return  <option value={f}>{f}</option>;
                }            
           });
        } else if (isDataTypeFloat(sc.dataType)) {
            return reportSettings.defaultFloatFormats.map(f => {
                if (f === sc.displayFormat) {
                    return <option value={f} selected>{f}</option>;
                } else {        
                    return  <option value={f}>{f}</option>;
                }            
           });
        } else if (isDataTypeInt(sc.dataType)) {
            return reportSettings.defaultIntFormats.map(f => {
                if (f === sc.displayFormat) {
                    return <option value={f} selected>{f}</option>;
                } else {        
                    return  <option value={f}>{f}</option>;
                }            
           });
        } else {
            return "";
        }
    };
    
    const getQuerySelectColumns = (type) => {
         if (currentQuery && selectColumns) {
            let nameLabel = getText("Header:");
            let alignLabel = getText("Header Align:");
            if (type === COMPONENT_TYPE_DATARECORD) {
                nameLabel = getText("Label:");
                alignLabel = getText("Label Align:");
            }

            let colcnt = selectColumns.length;
            return selectColumns.map((sc, indx) => {
                let wantFormat = isColumnFormatAvailable(sc);
                let isnum = isDataTypeNumeric(sc.dataType);
                let showAddTotal = isnum && isTabularDataGridComponent(currentComponent);
                return <div key={getUUID()} className="report-query-column">
                        <div draggable={true} 
                            className="detail-hdr"
                            id={"scol-" + indx}  
                            onDragStart={e => handleDragStart(e)} 
                            onDrop={e => handleDrop(e)} 
                            onDragOver={e => handleDragOver(e)}>
                            <span>
                                <MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getQueryColumnHelpText(sc))} />
                                <span title={getHeaderTitle(sc)} >{sc.displayName}</span>
                                <span style={{float: "right", marginRight: "15px"}}>
                                    <input id={"sel-" + indx}  name="selected" type="checkbox" defaultChecked={sc.selected} onChange={e => setQueryValue(e, indx)} /><label className="ck-label" htmlFor={"sel-" + indx}>{getText("Include Column")}</label>
                                    { showAddTotal && <input id={"at-" + indx} style={{marginLeft: "10px"}}  name="addTotal" type="checkbox" defaultChecked={sc.addTotal} onChange={e => setQueryValue(e, indx)} /> }
                                    { showAddTotal && <label className="ck-label" htmlFor={"at-" + indx}>{getText("Add Total")}</label>}
                                </span>    
                            </span>
                        </div>
                        <div className="tab platinum-b">
                            <div style={{paddingTop: "10%"}}>
                                {(indx > 0) && <span title={getText("Move up")}><AiOutlineCaretUp className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveSelectColumnUp(indx)} /></span>}
                                {(indx < (colcnt - 1)) && <span title={getText("Move down")}><AiOutlineCaretDown className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveSelectColumnDown(indx)} /></span>}
                            </div>
                        </div>

                        <div className="detail">
                            <div className="entrygrid-50p-50p">
                                <div className="entrygrid-100-175">
                                    <div className="label">{nameLabel}</div><div><input type="text" name="displayName" size={30} defaultValue={sc.displayName} onChange={e => setQueryValue(e, indx)}/></div>
                                    {wantFormat ? <div className="label">{getText("Format:")}</div> : <div style={{height: "30px"}}></div>}
                                    {wantFormat ? <div><select name="displayFormat" onChange={e => setQueryValue(e, indx)}><option value=""></option>{getQueryColumnFormatOptions(sc)}</select></div> : <div></div>}
                                </div> 
                                <div className="entrygrid-175-100">
                                     <div className="label">{alignLabel}</div><div><select name="headerTextAlign" onChange={e => setQueryValue(e, indx)}>{loadQueryColumnTextAlignOptions(sc, "headerTextAlign")}</select></div>
                                    <div className="label">{getText("Data Align:")}</div><div><select name="dataTextAlign" onChange={e => setQueryValue(e, indx)}>{loadQueryColumnTextAlignOptions(sc, "dataTextAlign")}</select></div>
                                </div> 
                            </div>    
                        </div>
                    </div>;  
                });
        } else {
            return "";
        }
    };
    
    const getGridLayoutOptions = () => {
        return GRID_LAYOUT_OPTIONS.map(o => {
            if (o === currentComponent.value.gridLayout) {
                return <option value={o} selected>{getText(o)}</option>;
            } else {
                return <option value={o}>{getText(o)}</option>;
            }
        });
    };
            
    const getDataComponentEntry = (type) => {
        if (type === COMPONENT_TYPE_DATARECORD) {
            return <div>
                <div className="entrygrid-125-100">
                    <div className="label">{getText("Row Gap(pixels):")}</div><div><NumberEntry id="rgne" name="rowGap" onChange={e => setValue(e)} defaultValue={5} min={1} max={20}/></div>
                </div>
                <div className="report-query-column-select">
                    {getQuerySelectColumns(type)}
                </div>            
            </div>;
        } else {               
           return <div>
                <div className="entrygrid-125-75-175-50">
                    <div className="label">{getText("Layout:")}</div>
                    <div>
                        <select name="gridLayout" onChange={e => setValue(e)}>
                            {getGridLayoutOptions()}
                        </select>
                    </div>
                    <div className="label">{getText("Alternate Row Color:")}</div>
                    <div>
                        <ColorPicker name="altrowcolor" color={currentComponent.value.altrowcolor} setColor={setColorValue}/>                 
                    </div>
                </div>
                <div className="report-query-column-select">
                    {getQuerySelectColumns(type)}
                </div>            
            </div>;
        }
    };
    
    const loadSelectColumnOptions = (sc) => {
        return currentQuery.selectColumns.map((c, indx) => {
            if (indx === sc.selectColumnIndex) {
                return <option value={indx} selected>{getQueryDataColumnDisplay(c)}</option>
            } else {
                return <option value={indx}>{getQueryDataColumnDisplay(c)}</option>
            }
        });
    };
 
    const getDataFieldComponentEntry = () => {
        if (currentComponent.value.dataColumns.length > 0) {
            let sc = currentComponent.value.dataColumns[0];
            let wantFormat = isColumnFormatAvailable(sc);
            return <div className="entrygrid-150-300">
                <div className="label"><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getQueryColumnHelpText(sc))}/>{getText("Query Column:")}</div><div><select name="selectColumnIndex" onChange={e => setValue(e)}>{loadSelectColumnOptions(sc)}</select></div>
                <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
                {wantFormat && <div className="label">{getText("Format:")}</div>}
                {wantFormat && <div><select name="displayFormat" onChange={e => setValue(e)}><option value=""></option>{getQueryColumnFormatOptions(sc)}</select></div>}
             </div>;
         } else {
             return "";
         }
    };

    const getComponentPanel = (type) => {
        if (currentComponent) {
            switch (type) {
                case COMPONENT_TYPE_TEXT:
                    return getTextEntry();
                case COMPONENT_TYPE_HYPERLINK:
                    return getHyperlinkEntry();
                case COMPONENT_TYPE_IMAGE:
                    return getImageEntry();
                case COMPONENT_TYPE_EMAIL:
                    return getEmailEntry();
                case COMPONENT_TYPE_SHAPE:
                    return getShapeEntry();
                case COMPONENT_TYPE_CURRENTDATE:
                    return getCurrentDateEntry();
                case COMPONENT_TYPE_PAGENUMBER:
                    return getPageNumberEntry();
                case COMPONENT_TYPE_DATAFIELD:
                    return getDataFieldComponentEntry();
                case COMPONENT_TYPE_DATAGRID:
                case COMPONENT_TYPE_DATARECORD:
                    return getDataComponentEntry(type);
            }
        }
    };
    
    const getDataComponentFontPanel = () => {
        let fontLabel = getText("Label Font");
        if ((currentComponent.type === COMPONENT_TYPE_DATAGRID)
            && (currentComponent.value.gridLayout !== FREEFORM_LAYOUT)) {
            fontLabel = getText("Header Font");
        }
        
        return <div className="entrygrid-50p-50p">
            <div className="ta-center tb-border">{fontLabel}</div>
            <div className="ta-center tb-border">{getText("Data Font")}</div>
            <FontPanel name="fontSettings"/><FontPanel name="fontSettings2"/>
        </div>;
    };
    
    const getDataComponentBorderPanel = () => {
        if (isTabularDataGridComponent(currentComponent)) {
            if (currentComponent.borderSettings3) {
                delete currentComponent.borderSettings3;
            }
            return <div className="entrygrid-50p-50p">
                <div className="ta-center tb-border">{getText("Header Border")}</div>
                <div className="ta-center tb-border">{getText("Data Border")}</div>
                <BorderPanel name="borderSettings"/><BorderPanel name="borderSettings2"/>
             </div>;
        } else {
            if (!currentComponent.borderSettings3) {
                currentComponent.borderSettings3 = getNewBorderSettings();
            }
            
            return <div className="entrygrid-33p-33p-33p">
                <div className="ta-center tb-border">{getText("Label Border")}</div>
                <div className="ta-center tb-border">{getText("Data Border")}</div>
                <div className="ta-center tb-border">{getText("Container Border")}</div>
                <BorderPanel name="borderSettings"/><BorderPanel name="borderSettings2"/><BorderPanel name="borderSettings3"/>
             </div>;
         }
   };

    const getTabs = () => {
        if (currentComponent) {
            let type = currentComponent.type;
            if (type === COMPONENT_TYPE_SHAPE) {
                return getShapeEntry();
            } else if (type === COMPONENT_TYPE_IMAGE) {
                return getImageEntry();
            } else {
                return <Tabs id="rcomp" className="mb-3">
                    <Tab eventKey="detail" title={typeDisplay + " " + getText("Detail")}>
                        {getComponentPanel(type)}
                    </Tab>
                        <Tab eventKey="font" title={getText("Font")}>
                        {isMultiFontPanelRequired(type) ? getDataComponentFontPanel() : <FontPanel name="fontSettings"/>}
                     </Tab>
                    <Tab eventKey="border" title={getText("Border")}>
                        {isMultiBorderPanelRequired(type) ? getDataComponentBorderPanel() : <BorderPanel name="borderSettings"/>}
                    </Tab>
                </Tabs>;
            }
        } else {
            return "";
        }
    };
    
    const isMultiFontPanelRequired = (type) => {
        return ((type === COMPONENT_TYPE_DATAGRID) || (type === COMPONENT_TYPE_DATARECORD));
    };

    const isMultiBorderPanelRequired = (type) => {
        return ((type === COMPONENT_TYPE_DATAGRID) || (type === COMPONENT_TYPE_DATARECORD));
    };

    const saveComponent = () => {
        if ((currentComponent.type === COMPONENT_TYPE_DATAGRID)
            || (currentComponent.type === COMPONENT_TYPE_DATARECORD)) {
            let c = copyObject(currentComponent);
            c.value.dataColumns = [];
            for (let i = 0; i < selectColumns.length; ++i) {
                if (selectColumns[i].selected) {
                    c.value.dataColumns.push(selectColumns[i]);
                }
             }
             
             if (!c.value.dataColumns 
                || (c.value.dataColumns.length !== dataColumnCount)) {
                reformatDataComponent(currentReport, c);
            }
            
            config.saveComponent(c, config.componentIndex);
        } else {
            config.saveComponent(currentComponent, config.componentIndex);
        }
    };
    
    return (<div className="static-modal">
            <Modal animation={false} 
                   show={config.show} 
                   size="lg"
                   onShow={onShow}
                   onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {getTabs()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => saveComponent()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>);
};

AddEditComponentModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default AddEditComponentModal;
