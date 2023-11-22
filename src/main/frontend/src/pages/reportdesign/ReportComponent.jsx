import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import SizingControl from "../../widgets/SizingControl"
import useMenu from "../../context/MenuContext";
import useReportDesign from "../../context/ReportDesignContext";
import {
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_COMPONENT_CONTAINER_BORDER,
    REPORT_COMPONENT_CONTAINER_BORDER_SELECTED,
    copyObject,
    MOVE_DROP_EFFECT,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
    }
from "../../utils/helper";

const ReportComponent = (props) => {
    const {component, 
        componentIndex, 
        onContextMenu} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        lastSelectedIndex, 
        setLastSelectedIndex
    } = useReportDesign();
    
    const {menuConfig} = useMenu();
    const onClick = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            let c = copyObject(component);
            let cr = copyObject(currentReport);
            let sindx = componentIndex;
            
            // if this was the last selected index and we are deselecting
            // set lastSelectedIndex to -1
            if (c.selected 
                && (componentIndex === lastSelectedIndex)) {
                sindx = -1;
            }
            
            c.selected = !c.selected;
            cr.reportComponents[componentIndex] = c;
            setCurrentReport(cr);
            setLastSelectedIndex(sindx);
        } else if ((component.type === "hyperlink") 
            || (component.type === "email")
            || (component.type === "image")) {
            e.stopPropagation();
        }
    };

    const getStyle = () => {
        let unit = currentReport.pageUnits.substring(0, 2);
 
        let retval = {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
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

    const haveAllBorders = (bs) => {
        return (bs.left && bs.top && bs.right && bs.bottom);
    };
        
    const haveBorder = (bs) => {
        return (bs.left ||  bs.top && bs.right || bs.bottom);
    };

    const getComponentValue = () => {
        let myStyle = {};
        switch (component.type) {
            case "text":
                return component.value;
            case "hyperlink":
                if (!component.value.underline) {
                    myStyle.textDecoration = "none";
                }
                return <a style={myStyle} href={component.value.url} target="_blank">{component.value.text}</a>;
            case "email":
                if (!component.value.underline) {
                    myStyle.textDecoration = "none";
                }
                return <a style={myStyle} href={"mailto:" + component.value.to + (component.value.subject ? "?\nsubject=" + component.value.subject : "")} target="_blank">{component.value.text}</a>;
            case "image":
                if (component.value.sizetofit) {
                    myStyle.width="100%";
                    myStyle.height="100%";
                }
                if (component.value.linkurl) {
                    myStyle.cursor = "pointer";
                    return <a style={{textDecoration: "none"}} href={component.value.linkurl} target="_blank"><img style={myStyle} alt={component.value.alttext} src={component.value.url} /></a>;
                } else {
                    return <img style={myStyle} alt={component.value.alttext} src={component.value.url}/>;
                }
            case "shape":
                if ((component.value.shape === "horizonal line") 
                   || (component.value.shape === "vertical line")) {
                    myStyle.background = component.value.fillcolor;
                    if (component.value.shape === "horizontal line") {
                        myStyle.height = component.value.size + "px";
                        myStyle.width = "100%";
                        myStyle.top = "50%";
                        return <div style={myStyle} />;
                    } else {
                        myStyle.width = component.value.size + "px";
                        myStyle.height = "100%";
                        myStyle.left = "50%";
                        return <div style={myStyle} />;
                    }
               } else {
                    myStyle.border = "solid " + component.value.width + "px " + component.value.bordercolor;

                    if (component.value.filled) {
                        myStyle.background = component.value.fillcolor;
                    } else {
                        myStyle.background = "transparent";
                    }

                    switch(component.value.shape) {
                        case "ellipse":
                            myStyle.borderRadius = "50%";
                            break;
                        case "rounded rectangle":
                            myStyle.borderRadius = "5%";
                            break;
                    }
                    
                    return <div style={myStyle} />;
               }

        }      
    };

    const getClassName = () => {
        if (component.selected) {
            return "report-component-sel";
        } else {
            return "report-component";
        }
    };

    const handleDragStart = (e) => {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        e.dataTransfer.setData("cinfo", JSON.stringify({index: componentIndex, left: x, top: y}));
        e.dataTransfer.effectAllowed = MOVE_DROP_EFFECT;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = MOVE_DROP_EFFECT;
    };

     return <div 
        className={getClassName()}
        draggable={true} 
        style={getStyle()}
        onContextMenu={e => onContextMenu(e, componentIndex, component.section)} 
        onClick={e => onClick(e)} 
        onDragOver={e => handleDragOver(e)}
        onDragStart={e => handleDragStart(e)}>
        <SizingControl corner="tl" componentIndex={componentIndex} component={component}/>
        <SizingControl corner="tr" componentIndex={componentIndex} component={component}/>
        <SizingControl corner="bl" componentIndex={componentIndex} component={component}/>
        <SizingControl corner="br" componentIndex={componentIndex} component={component}/>
        {getComponentValue()}
    </div>;
};

export default ReportComponent;