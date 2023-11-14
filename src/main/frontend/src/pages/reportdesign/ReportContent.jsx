import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useReportDesign from "../../context/ReportDesignContext";
import ContextMenu from "../../widgets/ContextMenu"
import useLang from "../../context/LangContext";
import {
    REPORT_ORIENTATION_LANDSCAPE,
    REPORT_ORIENTATION_PORTRAIT,
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    SPLITTER_GUTTER_SIZE,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    getReportHeightInPixels,
    getReportWidthInPixels,
    getReportHeight,
    getReportWidth,
    reportUnitsToPixels,
    pixelsToReportUnits
} from "../../utils/helper";

const ReportContent = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        getNewComponent
    } = useReportDesign();
    const [componentMenuConfig, setComponentMenuConfig] = useState({show: false});
    const reportWidth = getReportWidth(currentReport, reportSettings);
    const reportHeight = getReportHeight(currentReport, reportSettings);
    const reportWidthPixels = getReportWidthInPixels(currentReport, reportSettings);
    const reportHeightPixels = getReportHeightInPixels(currentReport, reportSettings);
    const {getText} = useLang();

    const contextMenuItems = [
        {
            text: getText("Edit Component"),
            action: "edit"
        },
        {
            text: getText("Delete Component"),
            action: "delete"
        },
        {
            text: getText("Push to Back"),
            action: "toback"
        },
        {
            text: getText("Move to Front"),
            action: "tofrom"
        }
    ];
    
    const hideContextMenu = (e) => {
        if (componentMenuConfig.show) {
            if (e) {
                e.preventDefault();
            }
            setComponentMenuConfig({show: false});
        }
    };
    
    const onContextMenu = (e, componentIndex) => {
        if (!componentMenuConfig.show) {
            e.preventDefault();
            let menuItems = [...contextMenuItems];
            if (!currentReport.reportComponents[componentIndex].selected) {
                menuItems.push({ text: getText("Select Component"),
                action: "select"});
            } else {
                menuItems.push({ text: getText("Deselect Component"),
                action: "deselect"});
            }

            setComponentMenuConfig({ 
                show: true,
                x: e.pageX, 
                y: e.pageY, 
                id: componentIndex, 
                menuItems: menuItems, 
                handleContextMenu: handleContextMenu});
        } else {
            hideContextMenu(e);
        }
   };

    const setComponentSelected = (componentIndex, select) => {
        let cr = {...currentReport};
        cr.reportComponents[componentIndex].selected = select;
        setCurrentReport(cr);
    };
    const handleContextMenu = (action, id) => {
        hideContextMenu();
        
        switch(action) {
            case "edit":
                break;
            case "delete":
                break;
            case "select":
                setComponentSelected(id, true);
                break;
            case "deselect":
                setComponentSelected(id, false);
                break;
            case "tofront":
                break;
            case "toback":
                break;
        }
     };
    
    const getStyle = () => {
        if (currentReport.reportComponents.length === 0) {
            currentReport.reportComponents.push(getNewComponent("body", "text", "this is a test"));
        }

        let width;
        let height;
        if (currentReport.pageUnits === REPORT_UNITS_INCH) {
            width = reportWidth + "in";
            height = reportHeight + "in";
        } else {
            width = reportWidth + "mm";
            height = reportHeight + "mm";
        }


        return {
            width: width,
            height: height,
            top: "-" + height
        };
    };

    const getHeaderHeightPercent = () => {
        let h = reportUnitsToPixels(currentReport.pageUnits, currentReport.headerHeight);
        return Math.max((100.0 * (h / reportHeightPixels)));
    };

    const getBodyHeightPercent = () => {
        let h = reportUnitsToPixels(currentReport.pageUnits, reportHeight - (currentReport.headerHeight + currentReport.footerHeight));
        return Math.min(100, (100.0 * (h / reportHeightPixels)));
    };

    const getFooterHeightPercent = () => {
        let h = reportUnitsToPixels(currentReport.pageUnits, currentReport.footerHeight);
        return Math.max(0, (100.0 * (h / reportHeightPixels)));
    };

    const onResize = (e) => {
        let r = {...currentReport};
        r.headerHeight = reportHeight * (e.sizes[0] / 100);
        r.footerHeight = reportHeight * (e.sizes[2] / 100);
        setCurrentReport(r);
    };

    const onClick = (e) => {
        hideContextMenu(e);    
    };

    return <div style={getStyle()} 
        className="report-content"
        onClick={e => onClick(e)}>
        <ContextMenu config={componentMenuConfig}/>
        <Splitter style={{border: "none",
            width: (reportWidthPixels - 1) + "px",
            height: (reportHeightPixels - 1) + "px"}} 
            layout="vertical"
            gutterSize={SPLITTER_GUTTER_SIZE / 2}
            onResizeEnd={e => onResize(e)}>
            <SplitterPanel style={{overflow: "hidden"}} size={getHeaderHeightPercent()} minSize={0}>
                <ReportSection section={REPORT_SECTION_HEADER} onContextMenu={onContextMenu}  hideContextMenu={hideContextMenu}/>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}}  size={getBodyHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_BODY} onContextMenu={onContextMenu} hideContextMenu={hideContextMenu}/>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}} size={getFooterHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_FOOTER} onContextMenu={onContextMenu}  hideContextMenu={hideContextMenu}/>
            </SplitterPanel>
        </Splitter>
    </div>;
};

export default ReportContent;