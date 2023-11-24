import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
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
    FORMAT_SETTING} from "../../utils/helper";
import {
    COMPONENT_TYPE_TEXT,  
    COMPONENT_TYPE_IMAGE, 
    COMPONENT_TYPE_SHAPE,
    COMPONENT_TYPE_EMAIL, 
    COMPONENT_TYPE_HYPERLINK,
    COMPONENT_TYPE_PAGENUMBER,
    COMPONENT_TYPE_CURRENTDATE,
    COMPONENT_TYPE_DATAGRID,
    COMPONENT_TYPE_DATAFIELD,
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
    getComponentValue,
    BORDER_STYLE_SOLID,
    DEFAULT_PAGE_NUMBER_FORMAT,
    DEFAULT_CURRENT_DATE_FORMAT,
    getPageNumberOptions,
    getCurrentDateFormatOptions} from "../../utils/reportHelper";

const AddEditComponentModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const [typeDisplay, setTypeDisplay] = useState("");
    const {currentReport, 
        reportSettings, 
        currentComponent, 
        setCurrentComponent} = useReportDesign();
    
    const getTitle = () => {
        if (currentComponent) {
            if (config.edit) {
                return getText("Edit " + typeDisplay + " Component");
            } else {
                return getText("Add " + typeDisplay + " Component");
            }
        } else {
            return "";
        }
    };

    const onHide = () => {
        config.hide();
    };

    const onShow = () => {
        setTypeDisplay(getText(getComponentTypeDisplayText(currentComponent.type)));
    };

    const setForegroundColor = (color) => {
        let c = {...currentComponent};
        c.foregroundColor = color;
        setCurrentComponent(c);
    };


    const setBackgroundColor = (color) => {
        let c = {...currentComponent};
        c.backgroundColor = color;
        setCurrentComponent(c);
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
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
        </div>;
    };
    
    const getHyperlinkEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("URL:")}</div><div><input type="text" name="url" size={40} onChange={e => setValue(e)} value={currentComponent.value.url}/></div>
            <div className="label">{getText("Display Text:")}</div><div><input name="text" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.text}/></div>
            <div></div><div><input key={getUUID()} name={UNDERLINE_SETTING} type="checkbox" checked={currentComponent.value.underline} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="textdecor">{getText("Underline")}</label></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
        </div>;
    };
    
    const getEmailEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("To:")}</div><div><input name="to" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.to}/></div>
            <div className="label">{getText("Subject:")}</div><div><input type="text" name="subject" size={40} onChange={e => setValue(e)} value={currentComponent.value.subject}/></div>
            <div className="label">{getText("Display Text:")}</div><div><input name="text" type="text" size={40} onChange={e => setValue(e)} value={currentComponent.value.text}/></div>
            <div></div><div><input key={getUUID()} name={UNDERLINE_SETTING} type="checkbox" checked={currentComponent.value.underline} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="textdecor">{getText("Underline")}</label></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
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
                </div>
                <div className="tb-border">{getText("Border:")}</div>    
                <div className="entrygrid-125-125">
                    <div></div><div><input key={getUUID()} name="wantborder" type="checkbox" checked={currentComponent.value.wantborder} onChange={e => setValue(e)} /><label className="ck-label" htmlFor="left">{getText("Show")}</label></div>
                    <div className="label">{getText("Style:")}</div>
                    <div><select name="border" onChange={e => setValue(e)}>{getBorderStyleOptions(reportSettings, currentComponent.value, true)}</select></div>
                    <div className="label">{getText("Width:")}</div>
                    <div><select name="width" onChange={e => setValue(e)}>{getBorderWidthOptions(reportSettings, currentComponent.value)}</select> </div>
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
                <div className="ta-center w-100"><div className="shape-example">{getComponentValue(reportSettings, currentComponent)}</div></div>
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
                        <div className="label">{getText("Width:")}</div><div><select name="width" onChange={e => setValue(e)}>{getBorderWidthOptions(reportSettings, currentComponent.value)}</select></div>
                        <div className="label">{getText("Color:")}</div><div><ColorPicker name="fillcolor" color={currentComponent.value.fillcolor} setColor={setColorValue}/></div>
                    </div>
                    <div className="tb-border">{getText("Example:")}</div>    
                    <div className="ta-center w-100"><div className="shape-example">{getComponentValue(reportSettings, currentComponent, true)}</div></div>
                </div>;
         }
    };

    const getCurrentDateEntry = () => {
       if (!currentComponent.value.format) {
            currentComponent.value.format = DEFAULT_CURRENT_DATE_FORMAT;
        }
        return <div className="entrygrid-125-125">
            <div className="label">{getText("Format:")}</div><div><select name="format" onChange={e => setValue(e)}>{getCurrentDateFormatOptions(currentComponent.value)}</select></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
        </div>;
    };
            
    const getPageNumberEntry = () => {
        if (!currentComponent.value.format) {
            currentComponent.value.format = DEFAULT_PAGE_NUMBER_FORMAT;
        }
        
        return <div className="entrygrid-125-125">
            <div className="label">{getText("Format:")}</div><div><select name={FORMAT_SETTING} onChange={e => setValue(e)}>{getPageNumberOptions(currentComponent.value)}</select></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
        </div>;
    };
            

    const getComponentPanel = () => {
        if (currentComponent) {
            switch (currentComponent.type) {
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
            }
        }
    };
    
    const getTabs = () => {
        if (currentComponent) {
            if (currentComponent.type === COMPONENT_TYPE_SHAPE) {
                return getShapeEntry();
            } else if (currentComponent.type === COMPONENT_TYPE_SUBREPORT) {
                return <div>subreport</div>;
            } else {
                return <Tabs id="rcomp" className="mb-3">
                    <Tab eventKey="detail" title={typeDisplay + " " + getText("Detail")}>
                        {getComponentPanel()}
                    </Tab>
                    <Tab eventKey="font" title={getText("Font")}>
                        <FontPanel />
                    </Tab>
                    <Tab eventKey="border" title={getText("Border")}>
                        <BorderPanel />
                    </Tab>
                </Tabs>;
            }
        } else {
            return "";
        }
    };
    
    const saveComponent = () => {
        config.saveComponent(currentComponent, config.componentIndex);
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
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
        </div>
        );
};

AddEditComponentModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default AddEditComponentModal;
