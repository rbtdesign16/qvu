import React, { useState, useEffect } from "react";
import ReportRuler from "./ReportRuler";
import Button from "react-bootstrap/Button"
import { slide as Menu } from "react-burger-menu";
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useAuth from "../../context/AuthContext";
import useMenu from "../../context/MenuContext";
import ContextMenu from "../../widgets/ContextMenu";
import useReportDesign from "../../context/ReportDesignContext";
import FontSelectModal from "../../widgets/FontSelectModal";
import BorderSelectModal from "../../widgets/BorderSelectModal";
import SaveDocumentModal from "../../widgets/SaveDocumentModal";
import DocumentSelectModal from "../../widgets/DocumentSelectModal";
import ReportSettingsModal from "./ReportSettingsModal";
import ReportContent from "./ReportContent";
import { flattenTree } from "react-accessible-treeview";
import { hasRoleAccess } from "../../utils/authHelper";
import PropTypes from "prop-types";
import {
SUCCESS,
        WARN,
        INFO,
        ERROR,
        REPORT_DOCUMENT_TYPE,
        HORIZONTAL_KEY,
        VERTICAL_KEY,
        getReportWidthInPixels,
        getReportHeightInPixels,
        SMALL_ICON_SIZE,
        LEFT,
        TOP,
        RIGHT,
        CENTER,
        BOTTOM,
        RULER_WIDTH
        } from "../../utils/helper";
import {
getReportSettings,
        getAvailableDocuments,
        isApiError,
        isApiSuccess
        } from "../../utils/apiHelper";
import { isQueryDesigner, isReportDesigner } from "../../utils/authHelper";
import {
        AiOutlineFontSize,
        AiOutlineBarChart,
        AiOutlineBorder,
        AiOutlineVerticalAlignBottom,
        AiOutlineVerticalAlignTop,
        }  from "react-icons/ai";
import { LiaFileInvoiceSolid,
        LiaFileMedicalSolid,
        LiaFileUploadSolid,
        LiaThListSolid,
        LiaAlignCenterSolid,
        LiaAlignLeftSolid,
        LiaAlignRightSolid,
        LiaWindowRestoreSolid} from "react-icons/lia";

const ReportDesign = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const {showMenu, hideMenu, menuConfig} = useMenu();
    const {getText} = useLang();
    const [showFontSelect, setShowFontSelect] = useState({show: false});
    const [showBorderSelect, setShowBorderSelect] = useState({show: false});
    const [showReportSettings, setShowReportSettings] = useState({show: false});
    const [showSaveDocument, setShowSaveDocument] = useState({show: false, type: REPORT_DOCUMENT_TYPE});
    const [showDocumentSelect, setShowDocumentSelect] = useState({show: false, type: REPORT_DOCUMENT_TYPE});
    const {authData, setAuthData} = useAuth();
    const {showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        setNewReport,
        initializeReportSettings,
        haveSelectedComponents,
        getNewFontSettings,
        getNewBorderSettings} = useReportDesign();

    const getComponentSelectMenu = () => {
        let retval = [];

        for (let i = 0; i < reportSettings.reportObjectTypes.length; ++i) {
            retval.push({
                text: getText(reportSettings.reportObjectTypes[i]),
                action: reportSettings.reportObjectTypes[i]
            });
        }
        return retval;
    };

    const handleAddComponent = (type) => {
        alert("----->" + type);
    };

    const handleStateChange = (state) => {
        setMenuOpen(state.isOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const canSave = () => {
        return isReportDesigner(authData);
    };

    const onAddComponent = (e) => {
        closeMenu();
        if (!menuConfig.show) {
            e.preventDefault();

            const items = getComponentSelectMenu();
            showMenu({
                show: true,
                x: e.pageX,
                y: 150,
                menuItems: items,
                handleContextMenu: handleAddComponent});
        } else {
            hideMenu(e);
        }

    };

    const onTextAlign = (align) => {
        let cr = {...currentReport};
        
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].selected) {
                cr.reportComponents[i].align = align;
            }
        }
        
        closeMenu();
        setCurrentReport(cr);
    };
    
    const hideFontSettings = () => {
        setShowFontSelect({show: false});
    };

    const hideBorderSettings = () => {
        setShowBorderSelect({show: false});
    };
    
    const saveFontSettings = (fs) => {
        hideFontSettings();

        let cr = {...currentReport};
        
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].selected) {
                cr.reportComponents[i].fontSettings = {...fs};
            }
        }
        
        setCurrentReport(cr);
    };
    
    const saveBorderSettings = (bs) => {
        hideBorderSettings();

        let cr = {...currentReport};
        
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].selected) {
                cr.reportComponents[i].borderSettings = {...bs};
            }
        }
        
        setCurrentReport(cr);
    }


    const onSetFont = () => {
        closeMenu();
        setShowFontSelect({
            show: true,
            hide: hideFontSettings,
            save: saveFontSettings,
            reportSettings: reportSettings,
            fontSettings: getNewFontSettings()
        });
    };

    const onSetBorder = () => {
        closeMenu();
        setShowBorderSelect({
            show: true,
            hide: hideBorderSettings,
            save: saveBorderSettings,
            reportSettings: reportSettings,
            borderSettings: getNewBorderSettings()
        });
    };


    const onComponentAlign = (align) => {
        closeMenu();
    };

    const hideReportSettings = () => {
        setShowReportSettings({show: false});
    };

    const saveReportSettings = (settings) => {
        let cr = {...currentReport};
        cr.pageSize = settings.pageSize;
        cr.pageOrientation = settings.pageOrientation;
        cr.pageUnits = settings.pageUnits;
        cr.pageBorder = [Number(settings.borderLeft), Number(settings.borderTop), Number(settings.borderRight), Number(settings.borderBottom)];
        setCurrentReport(cr);
        setShowReportSettings({show: false});
    };

    const onReportSettings = () => {
        closeMenu();
        setShowReportSettings({show: true, report: currentReport, reportSettings: reportSettings, hide: hideReportSettings, saveSettings: saveReportSettings});
    };

    const getMenu = () => {
        let sel = haveSelectedComponents();

        return <Menu width={ 230 } 
              isOpen={menuOpen} 
              onStateChange={(state) => handleStateChange(state)}>
            <div onClick={onShowDocumentSelect}><LiaFileInvoiceSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Load Report")}</div>
            <div onClick={onNewReport}><LiaFileMedicalSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("New Report")}</div>
            {canSave() && <div onClick={onSaveDocument}><LiaFileUploadSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Save Report")}</div>}
            <hr  style={{cursor: "none"}} />
            <div onClick={onReportSettings}><LiaWindowRestoreSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Page Settings")}</div>
            <hr  style={{cursor: "none"}} />
            <div onClick={e => onAddComponent(e)}><LiaThListSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Add Component")}</div>
            {sel && <hr  style={{cursor: "none"}} />}
            {sel && <div onClick={onSetFont}><AiOutlineFontSize size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Font")}</div>}
            {sel && <div onClick={onSetBorder}><AiOutlineBorder size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Border")}</div>}
            {sel && <hr  style={{cursor: "none"}} />}
            {sel && <div onClick={e => onTextAlign(LEFT)}><LiaAlignLeftSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Left")}</div>}
            {sel && <div onClick={e => onTextAlign(CENTER)}><LiaAlignCenterSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Center")}</div>}
            {sel && <div onClick={e => onTextAlign(RIGHT)}><LiaAlignRightSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Right")}</div>}
            {sel && <hr  style={{cursor: "none"}} />}
            {sel && <div onClick={e => onComponentAlign(LEFT)}><AiOutlineVerticalAlignBottom style={{transform: 'rotate(90deg)'}} size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Left")}</div>}
            {sel && <div onClick={e => onComponentAlign(TOP)}><AiOutlineVerticalAlignTop size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Top")}</div>}
            {sel && <div onClick={e => onComponentAlign(RIGHT)}><AiOutlineVerticalAlignTop style={{transform: 'rotate(90deg)'}} size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Right")}</div>}
            {sel && <div onClick={e => onComponentAlign(BOTTOM)}><AiOutlineVerticalAlignBottom size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Bottom")}</div>}
        
        </Menu>;
    };

    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };

    const onShowDocumentSelect = async () => {
        closeMenu();
        showMessage(INFO, getText("Loading available reports", "..."), null, true);

        let res = await getAvailableDocuments(REPORT_DOCUMENT_TYPE);

        hideMessage();

        if (isApiSuccess(res)) {
            setShowDocumentSelect({show: true, type: REPORT_DOCUMENT_TYPE, hide: hideDocumentSelect, loadDocument: loadDocument, treeRoot: flattenTree(res.result)});
        } else {
            showMessage(ERROR, res.message);
        }
    };

    const hideShowSave = () => {
        setShowSaveDocument({show: false, type: REPORT_DOCUMENT_TYPE});
    };

    const saveReportDocument = async (name, group) => {
        closeMenu();
    };

    const onSaveDocument = async () => {
        closeMenu();
        setShowSaveDocument({show: true, type: REPORT_DOCUMENT_TYPE, saveDocument: saveReportDocument, hide: hideShowSave, currentDocument: currentReport});
    };


    const onNewReport = () => {
        setNewReport();
    };

    const loadDocument = (group, name) => {
        setNewReport();
        populateDocument(group, name);
    };

    const populateDocument = async (group, name) => {
        hideDocumentSelect();
        showMessage(INFO, getText("Loading report", " " + name + "..."), null, true);

        let res = await getDocument(REPORT_DOCUMENT_TYPE, group, name);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            setNewReport();
            let doc = res.result;

            setCurrentReport({
                name: doc.name,
                group: doc.documentGroupName,
                newRecord: false,
                reportComponents: []
            });

            hideMessage();
        }
    };

    const getReportInfo = () => {
        return  <span style={{marginLeft: "10px"}} className="cobaltBlue-f">
            <span style={{color: "darkslategray"}}>{getText("Group", ":  ")}</span>
            {currentReport.group} 
            <span style={{paddingLeft: "15px", color: "darkslategray"}}>{getText("Report", ":  ")}</span>
            {currentReport.name}
            <span style={{paddingLeft: "15px", color: "darkslategray"}}>{getText("Page Size", ":  ")}</span>
            {currentReport.pageSize}
        </span>;
    };

    const loadReportSettings = async () => {
        let res = await getReportSettings();
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            initializeReportSettings(res.result);
        }
    };

    const isSaveEnabled = () => {
        return true;
    };

    useEffect(() => {
        if (!reportSettings) {
            loadReportSettings();
        }
    });

    if (reportSettings && currentReport) {
        return (
                <div style={{top: "40px", width: "100%"}} className="report-design-tab">
                    <ContextMenu />
                    <FontSelectModal config={showFontSelect}/>
                    <BorderSelectModal config={showBorderSelect}/>
                    <ReportSettingsModal config={showReportSettings}/>
                    <SaveDocumentModal config={showSaveDocument}/>
                    <DocumentSelectModal config={showDocumentSelect}/>
                    {getReportInfo()}
                    <div style={{width: "100%", height: "calc(100% - 60px)", overflow: "auto"}} >
                        <div className="bm-container">{getMenu()}</div>
                        <ReportRuler type={HORIZONTAL_KEY} report={currentReport} height={RULER_WIDTH} width={getReportWidthInPixels(currentReport, reportSettings)}/>
                        <ReportRuler type={VERTICAL_KEY} report={currentReport}  height={getReportHeightInPixels(currentReport, reportSettings)} width={RULER_WIDTH}/>
                        <ReportContent />
                    </div>
                </div>
                );
    } else {
        return <div></div>;
    }
};

export default ReportDesign;