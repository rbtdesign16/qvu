import React, {useState, useEffect} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useReportDesign from "../../context/ReportDesignContext";
import useMenu from "../../context/MenuContext";
import ContextMenu from "../../widgets/ContextMenu"
import AddEditComponentModal from "./AddEditComponentModal";
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
    pixelsToReportUnits,
    ESCAPE_KEY,
    copyObject,
    isArrowKey,
    ARROW_UP_KEY,
    ARROW_DOWN_KEY,
    ARROW_LEFT_KEY,
    ARROW_RIGHT_KEY,
    PIXELS_PER_KEYDOWN_MOVE,
    isQueryRequiredForReportObject,
    confirm,
    getComponentTypeDisplayText
} from "../../utils/helper";

const ReportContent = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        currentComponent,
        setCurrentComponent,
        getNewComponent,
        lastSelectedIndex,
        setLastSelectedIndex,
        haveSelectedComponents
    } = useReportDesign();
    const reportWidth = getReportWidth(currentReport, reportSettings);
    const reportHeight = getReportHeight(currentReport, reportSettings);
    const reportWidthPixels = getReportWidthInPixels(currentReport, reportSettings);
    const reportHeightPixels = getReportHeightInPixels(currentReport, reportSettings);
    const [showAddEditComponent, setShowAddEditComponent] = useState({show: false, componentIndex: -100});
    const {showMenu, hideMenu, menuConfig} = useMenu();
    const {getText} = useLang();

    const getComponentContextMenuItems = (componentIndex) => {
        let retval = [];
        
        retval.push({
            text: getText("Edit Component"),
            action: "edit"
        },
        {
            text: getText("Delete Component"),
            action: "delete"
        },
        {
            separator: true
        },
        {
            text: getText("Push to Back"),
            action: "toback"
        },
        {
            text: getText("Move to Front"),
            action: "tofront"
        },
        {
            separator: true
        });
    
    
        if (!currentReport.reportComponents[componentIndex].selected) {
           retval.push({text: getText("Select Component"),
                action: "select"});
        } else {
            retval.push({text: getText("Deselect Component"),
                action: "deselect"});
        }
 
        return retval;
    };

    const getSectionContextMenuItems = () => {
        let retval = [{group: getText("Add Component")}];
        let fd = false;
        for (let i = 0; i < reportSettings.reportObjectTypes.length; ++i) {
            let qr = isQueryRequiredForReportObject(reportSettings.reportObjectTypes[i]);
            if (currentReport.queryDocumentName || !qr) {
                if (qr && !fd) {
                    retval.push({separator: true});
                    fd = true;
                }
                
                retval.push({
                    style: {paddingLeft: "20px"},
                    text: " - " + getText(reportSettings.reportObjectTypes[i]),
                    action: reportSettings.reportObjectTypes[i].toLowerCase().replaceAll(" ", "")
                });
            }
        }
        
        retval.push({ separator: true});
        retval.push({
            text: getText("Select All"),
            action: "selectall"
        });
        
        retval.push({
            text: getText("Deselect All"),
            action: "deselectall"
        });
        
        return retval;
    };
    
    
    const onSelectAll = (sel, section) => {
        hideMenu();
        
        let cr = copyObject(currentReport);
        
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].section === section) {
                cr.reportComponents[i].selected = sel;
            }
        }
        
        if (!sel) {
            setLastSelectedIndex(-1);
        } else {
            setLastSelectedIndex(cr.reportComponents.length - 1);
        }
        
        setCurrentReport(cr);
    };
    
    
    const onContextMenu = (e, componentIndex, section) => {
        if (!menuConfig.show) {
            e.preventDefault();
            e.stopPropagation();
            let menuItems;

            if (componentIndex < 0) {
                menuItems = getSectionContextMenuItems();
            } else {
                menuItems = getComponentContextMenuItems(componentIndex);
            }
            showMenu({
                show: true,
                x: e.pageX,
                y: e.pageY,
                id: componentIndex,
                section: section,
                menuItems: menuItems,
                handleContextMenu: handleContextMenu});

        } else {
            hideMenu(e);
        }
    };

    const setComponentSelected = (componentIndex, select) => {
        let cr = copyObject(currentReport);
        cr.reportComponents[componentIndex].selected = select;
        if (select) {
            setLastSelectedIndex(componentIndex);
        } else if (lastSelectedIndex === componentIndex) {
            setLastSelectedIndex(-1);
        }
        setCurrentReport(cr);
    };

    const getMaxZindex = () => {
        let retval = 0;
        for (let i = 0; i < currentReport.reportComponents.length; ++i) {
            if (currentReport.reportComponents[i].zindex) {
                let z = Number(currentReport.reportComponents[i].zindex);
                if (retval < z) {
                    retval = z;
                }
            }
        }

        if (retval === 0) {
            retval = 1;
        }

        return retval;
    };

    const getMinZindex = () => {
        let retval = 100;
        for (let i = 0; i < currentReport.reportComponents.length; ++i) {
            if (currentReport.reportComponents[i].zindex) {
                let z = Number(currentReport.reportComponents[i].zindex);
                if (retval > z) {
                    retval = z;
                }
            }
        }

        if (retval === 100) {
            retval = 1;
        }

        return retval;
    };

    const moveComponentToBack = (componentIndex) => {
        let minz = getMinZindex();
        let cr = copyObject(currentReport);
        cr.reportComponents[componentIndex].zindex = minz - 1;
        setCurrentReport(cr);
    };

    const moveComponentToFront = (componentIndex) => {
        let maxz = getMaxZindex();
        let cr = copyObject(currentReport);
        cr.reportComponents[componentIndex].zindex = maxz + 1;
        setCurrentReport(cr);
    };
    
    const onDeleteComponent = async (componentIndex) => {
        if (await confirm(getText("delete-component-prompt"))) {
            deleteComponent(componentIndex);
        }
    };
    
    const deleteComponent = (componentIndex) => {
        let cr = copyObject(currentReport);
        let c = [];
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (i !== componentIndex) {
                c.push(cr.reportComponents[i]);
            }
        }
        cr.reportComponents = c;
        if (lastSelectedIndex === componentIndex) {
            setLastSelectedIndex(-1);
        }

        setCurrentReport(cr);
    };

    const editComponent = (componentIndex) => {
        let c = copyObject(currentReport.reportComponents[componentIndex]);
        setCurrentComponent(c);
        setShowAddEditComponent({
            show: true, 
            edit: true,
            componentIndex: componentIndex,
            saveComponent: saveReportComponent, 
            hide: hideAddEditComponent});
    };

    const hideAddEditComponent = () => {
        setShowAddEditComponent({show: false});
    };
    
    const saveReportComponent = (component, componentIndex) => {
        hideAddEditComponent();
        let cr = copyObject(currentReport);
        if (componentIndex > -1) {
            cr.reportComponents.splice(componentIndex, 1, component);
        } else {
            cr.reportComponents.push(component);
        }
        setCurrentComponent(null);
        setCurrentReport(cr);
    };
    
    const onAddComponent = (section, type, left, top) => {
        let c = getNewComponent(section, type);
        c.left = left;
        c.top =  top;
        
        setCurrentComponent(c);
        setShowAddEditComponent({show: true, 
            edit: false,
            componentIndex: -1,
            saveComponent: saveReportComponent, 
            hide: hideAddEditComponent});
    };

    const handleContextMenu = (action, id, section, x, y) => {
        hideMenu();

        switch (action) {
            case "edit":
                editComponent(id);
                break;
            case "delete":
                onDeleteComponent(id);
                break;
            case "select":
                setComponentSelected(id, true);
                break;
            case "deselect":
                setComponentSelected(id, false);
                break;
            case "tofront":
                moveComponentToFront(id);
                break;
            case "toback":
                moveComponentToBack(id);
                break;
            case "selectall":
                onSelectAll(true, section);
                break;
            case "deselectall":
                onSelectAll(false, section);
                break;
            case "text":   
            case "image":   
            case "email":   
            case "shape":   
            case "hyperlink":   
            case "pagenumber":   
            case "currentdate":   
            case "datagrid":   
            case "datafield":   
            case "datarecord":   
            case "chart":   
            case "subreport":
                let sec = document.getElementById(section);
                let rc = sec.getBoundingClientRect();
                let left = pixelsToReportUnits(currentReport.pageUnits, (x - rc.left));
                let top = pixelsToReportUnits(currentReport.pageUnits, (y - rc.top));

                onAddComponent(section, action, left, top);
                break;
        }
    };

    const getStyle = () => {
        if (currentReport.reportComponents.length === 0) {
            currentReport.reportComponents.push(getNewComponent("body", "text", "this is a test"));
            let c = getNewComponent("body", "text", "this is another test", {left: 2, top: 2, width: 2, height: 1});
      
            currentReport.reportComponents.push(c);
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
        let r = copyObject(currentReport);
        r.headerHeight = reportHeight * (e.sizes[0] / 100);
        r.footerHeight = reportHeight * (e.sizes[2] / 100);
        setCurrentReport(r);
    };

    const onClick = (e) => {
        hideMenu(e);
    };

    const componentCanMove = (section, key, pos) => {
        let retval = false;
        let gutterHeight = pixelsToReportUnits(currentReport.pageUnits, SPLITTER_GUTTER_SIZE);
        switch (section) {
            case REPORT_SECTION_HEADER:
                switch (key) {
                    case ARROW_UP_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_DOWN_KEY:
                        retval = (pos < (currentReport.headerHeight - currentReport.pageBorder[1]));
                        break;
                    case ARROW_LEFT_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_RIGHT_KEY:
                        retval = (pos < (reportWidth - (currentReport.pageBorder[2] + currentReport.pageBorder[0])));
                        break;
                }
                break;
            case REPORT_SECTION_BODY:
                switch (key) {
                    case ARROW_UP_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_DOWN_KEY:
                        retval = (pos < (reportHeight - (currentReport.headerHeight + currentReport.footerHeight + gutterHeight)));
                        break;
                    case ARROW_LEFT_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_RIGHT_KEY:
                        retval = (pos < (reportWidth - (currentReport.pageBorder[2] + currentReport.pageBorder[0])));
                        break;
                }
                break;
            case REPORT_SECTION_FOOTER:
                switch (key) {
                    case ARROW_UP_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_DOWN_KEY:
                        retval = (pos < (currentReport.footerHeight - currentReport.pageBorder[3]));
                        break;
                    case ARROW_LEFT_KEY:
                        retval = (pos > 0);
                        break;
                    case ARROW_RIGHT_KEY:
                        retval = (pos < (reportWidth - (currentReport.pageBorder[2] + currentReport.pageBorder[0])));
                        break;
                }
                break;
        }

        return retval;
    };

    const onKeyDown = (e) => {
        if (isArrowKey(e) && haveSelectedComponents()) {
            e.preventDefault();
            let cr = copyObject(currentReport);
            let updated = false;
            for (let i = 0; i < cr.reportComponents.length; ++i) {
                let c = cr.reportComponents[i];

                if (c.selected) {
                    let delta = pixelsToReportUnits(currentReport.pageUnits, PIXELS_PER_KEYDOWN_MOVE);

                    if (!e.shiftKey) {
                        let code = e.code.toLowerCase();
                        switch (code) {
                            case ARROW_UP_KEY:
                                if (componentCanMove(c.section, code, (c.top - delta))) {
                                    c.top -= delta;
                                    updated = true;
                                }
                                break;
                            case ARROW_DOWN_KEY:
                                if (componentCanMove(c.section, code, (c.top + delta))) {
                                    c.top += delta;
                                    updated = true;
                                }
                                break;
                            case ARROW_LEFT_KEY:
                                if (componentCanMove(c.section, code, (c.left - delta))) {
                                    c.left -= delta;
                                    updated = true;
                                }
                                break;
                            case ARROW_RIGHT_KEY:
                                if (componentCanMove(c.section, code, (c.left + delta))) {
                                    c.left += delta;
                                    updated = true;
                                }
                                break;
                        }
                    } else {
                        updated = true;
                        switch (e.code.toLowerCase()) {
                            case ARROW_UP_KEY:
                                c.height -= delta;
                                break;
                            case ARROW_DOWN_KEY:
                                c.height += delta;
                                break;
                            case ARROW_LEFT_KEY:
                                c.width -= delta;
                                break;
                            case ARROW_RIGHT_KEY:
                                c.width += delta;
                                break;
                        }
                    }
                }
            }

            if (updated) {
                setCurrentReport(cr);
            }
        }
    };

    return <div tabIndex="0" style={getStyle()} 
         className="report-content"
         onKeyDown={e => onKeyDown(e)}
         onClick={e => onClick(e)}>
        <ContextMenu />
        <AddEditComponentModal config={showAddEditComponent}/>
        <Splitter style={{border: "none",
            width: (reportWidthPixels - 1) + "px",
            height: (reportHeightPixels - 1) + "px"}} 
            layout="vertical"
            gutterSize={SPLITTER_GUTTER_SIZE / 2}
            onResizeEnd={e => onResize(e)}>
            <SplitterPanel style={{overflow: "hidden"}} size={getHeaderHeightPercent()} minSize={0}>
                <ReportSection section={REPORT_SECTION_HEADER} onContextMenu={onContextMenu} />
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}}  size={getBodyHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_BODY} onContextMenu={onContextMenu} />
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}} size={getFooterHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_FOOTER} onContextMenu={onContextMenu}/>
            </SplitterPanel>
        </Splitter>
    </div>;
};

export default ReportContent;