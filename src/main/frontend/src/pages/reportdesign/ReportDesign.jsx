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
    QUERY_DOCUMENT_TYPE,
    SMALL_ICON_SIZE,
    replaceTokens,
    copyObject,
    showDocumentFromBlob,
    PDF_MIME_TYPE
} from "../../utils/helper";

import {
    HORIZONTAL_KEY,
    VERTICAL_KEY,
    getReportWidthInPixels,
    getReportHeightInPixels,
    LEFT,
    TOP,
    RIGHT,
    CENTER,
    BOTTOM,
    RULER_WIDTH,
    isQueryRequiredForReportObject,
    REPORT_UNITS_MM,
    INCHES_TO_MM,
    MM_TO_INCHES,
    REPORT_SECTION_BODY
} from "../../utils/reportHelper";

import {
    getReportSettings,
    getAvailableDocuments,
    saveDocument,
    getDocument,
    isApiError,
    isApiSuccess,
    generateReport
    } from "../../utils/apiHelper";
import { isQueryDesigner, isReportDesigner } from "../../utils/authHelper";
import { BiWindowOpen, BiWindowClose  } from "react-icons/bi";
import { RxAlignLeft, 
    RxAlignTop, 
    RxAlignBottom, 
    RxAlignRight,
    RxSpaceBetweenVertically,
    RxSpaceBetweenHorizontally 
} from "react-icons/rx";
import {
    AiOutlineFontSize,
    AiOutlineBarChart,
    AiOutlineBorder
    }  from "react-icons/ai";
import { LiaFileInvoiceSolid,
    LiaFileMedicalSolid,
    LiaFileUploadSolid,
    LiaThListSolid,
    LiaAlignCenterSolid,
    LiaAlignLeftSolid,
    LiaAlignRightSolid,
    LiaWindowRestoreSolid,
    LiaCoinsSolid,
    LiaUndoAltSolid,
    LiaRunningSolid} from "react-icons/lia";

const ReportDesign = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const {showMenu, hideMenu, menuConfig} = useMenu();
    const {getText} = useLang();
    const [showFontSelect, setShowFontSelect] = useState({show: false});
    const [showBorderSelect, setShowBorderSelect] = useState({show: false});
    const [showReportSettings, setShowReportSettings] = useState({show: false});
    const [showSaveDocument, setShowSaveDocument] = useState({show: false, type: REPORT_DOCUMENT_TYPE});
    const [showDocumentSelect, setShowDocumentSelect] = useState({show: false});
    const {authData, setAuthData} = useAuth();
    const {showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        currentComponent,
        setCurrentComponent,
        setNewReport,
        initializeReportSettings,
        haveSelectedComponents,
        getNewFontSettings,
        getNewBorderSettings,
        lastSelectedIndex,
        setLastSelectedIndex,
        undo,
        canUndo,
        setCurrentQuery} = useReportDesign();

    const onUndo = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        undo();
    };
    

    const handleStateChange = (state) => {
        if (state.isOpen) {
            hideMenu();
        }
        setMenuOpen(state.isOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const canSave = () => {
        return isReportDesigner(authData);
    };

    const onRunReport = async() => {
        let report = copyObject(currentReport);
        report.runUser = authData.currentUser.userId;
        let res = await generateReport(currentReport);

        let blob = new Blob([res], {
            type: PDF_MIME_TYPE
        });

        showDocumentFromBlob(blob);
    };

    const onTextAlign = (align) => {
        let cr = copyObject(currentReport);
        
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].selected) {
                cr.reportComponents[i].align = align;
            }
        }
        
        closeMenu();
        setCurrentReport(cr, true);
    };
    
    const onComponentSize = (ver) => {
        let cr = copyObject(currentReport);
        let basec = cr.reportComponents[lastSelectedIndex];
        for (let i = 0; i < cr.reportComponents.length; ++i) {
            if (cr.reportComponents[i].selected && (i !== lastSelectedIndex)) {
                if (ver) {
                    cr.reportComponents[i].height = basec.height;
                } else {
                    cr.reportComponents[i].width = basec.width;
                }   
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

        if (fs) {
            let cr = copyObject(currentReport);

            for (let i = 0; i < cr.reportComponents.length; ++i) {
                if (cr.reportComponents[i].selected) {
                    cr.reportComponents[i].fontSettings = copyObject(fs);
                }
            }

            setCurrentComponent(null);
            setCurrentReport(cr);
        }
    };
    
    const saveBorderSettings = (bs) => {
        hideBorderSettings();

        if (bs) {
            let cr = copyObject(currentReport);

            for (let i = 0; i < cr.reportComponents.length; ++i) {
                if (cr.reportComponents[i].selected) {
                    cr.reportComponents[i].borderSettings = copyObject(bs);
                }
            }

            setCurrentComponent(null);
            setCurrentReport(cr);
        }
    };

    const onSetFont = () => {
        closeMenu();
        setShowFontSelect({
            show: true,
            hide: hideFontSettings,
            save: saveFontSettings
         });
    };

    const onSetBorder = () => {
        closeMenu();
        setShowBorderSelect({
            show: true,
            hide: hideBorderSettings,
            save: saveBorderSettings
        });
    };

    const onComponentAlign = (align) => {
        closeMenu();
        
        if (currentReport.reportComponents 
            && (lastSelectedIndex >= 0) 
            && (lastSelectedIndex < currentReport.reportComponents.length)) {
            let cr = copyObject(currentReport);

            let basecr = cr.reportComponents[lastSelectedIndex];

            for (let i = 0; i < cr.reportComponents.length; ++i) {
                if ((i !== lastSelectedIndex) 
                     && (basecr.section === cr.reportComponents[i].section)) {
                    switch (align) {
                        case LEFT:
                            cr.reportComponents[i].left = basecr.left;
                            break;
                        case TOP:
                            cr.reportComponents[i].top = basecr.top;
                            break;
                        case RIGHT:
                            cr.reportComponents[i].left = cr.reportComponents[i].left = (basecr.left + basecr.width) - cr.reportComponents[i].width; 
                            break;
                        case BOTTOM:
                            cr.reportComponents[i].top = cr.reportComponents[i].top = (basecr.top + basecr.height) - cr.reportComponents[i].height; 
                            break;
                    }
                }
            }

            setCurrentReport(cr);
        }
    };

    const hideReportSettings = () => {
        setShowReportSettings({show: false});
    };

    const saveReportSettings = (settings) => {
        let cr = copyObject(currentReport);
        cr.pageSize = settings.pageSize;
        cr.pageOrientation = settings.pageOrientation;
        let convFactor = 1.0;
        if (settings.pageUnits !== cr.pageUnits) {
            if (cr.pageUnits === REPORT_UNITS_MM) {
                convFactor = MM_TO_INCHES;
            } else {
                convFactor = INCHES_TO_MM;;
            }
        }
        
        cr.pageUnits = settings.pageUnits;
        cr.pageBorder = [Number(settings.borderLeft), 
            Number(settings.borderTop), 
            Number(settings.borderRight), 
            Number(settings.borderBottom)];
        
        if (convFactor !== 1) {
            cr.headerHeight *= convFactor;
            cr.footerHeight *= convFactor;
            for (let i = 0; i < cr.reportComponents.length; ++i) {
                cr.reportComponents[i].left *= convFactor;
                cr.reportComponents[i].top *= convFactor;
                cr.reportComponents[i].width *= convFactor;
                cr.reportComponents[i].height *= convFactor;
            }
        }
        
        setCurrentReport(cr);
        setShowReportSettings({show: false});
    };

    const onReportSettings = () => {
        closeMenu();
        setShowReportSettings({show: true, report: currentReport, reportSettings: reportSettings, hide: hideReportSettings, saveSettings: saveReportSettings});
    };

    const loadQueryDocument = async (group, name) => {
        showMessage(INFO, getText("Loading document",  name), null, true);
        let res = await getDocument(QUERY_DOCUMENT_TYPE, group, name);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            hideMessage();
            return res.result;
       }
    };
    
    const setQueryDocument = async (group, name) => {
        hideDocumentSelect();
        let cr = copyObject(currentReport);
        cr.queryDocumentGroup = group;
        cr.queryDocumentName = name;
         
        let qdoc = await loadQueryDocument(group, name);
        
        if (qdoc) {
            if (cr.reportComponents && (cr.reportComponents.length > 0)) {
                // if we have changed query document then clear any
                // query-related components from report
               if ((group !== cr.getQueryDocuentGroup) || (name !== cr.queryDocumentName)) {
                   let c = [];

                   for (let i = 0; i < cr.reportComponents.length; ++i) {
                       if (!isQueryRequiredForReportObject(cr.reportComponents[i].type)) {
                           c.push(cr.reportComponents[i]);
                       }
                   }

                   cr.reportComponents = c;
               }
           }

           setCurrentQuery(qdoc);
           setCurrentReport(cr);
        }
     };

    const onShowQueryDocumentSelect = async (e) => {
        closeMenu();

        showMessage(INFO, replaceTokens(getText("Loading available documents", "..."), getText(QUERY_DOCUMENT_TYPE)), null, true);

        let res = await getAvailableDocuments(QUERY_DOCUMENT_TYPE);

        hideMessage();
        if (isApiSuccess(res)) {
            setShowDocumentSelect({show: true, type: QUERY_DOCUMENT_TYPE, hide: hideDocumentSelect, loadDocument: setQueryDocument, treeRoot: flattenTree(res.result)});
        } else {
            showMessage(ERROR, res.message);
        }
    };

    const getMenu = () => {
        let sel = haveSelectedComponents();

        return <Menu width={ 230 } 
              isOpen={menuOpen} 
              onStateChange={(state) => handleStateChange(state)}>
            <div onClick={onShowReportDocumentSelect}><LiaFileInvoiceSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Load Report")}</div>
            <div onClick={onNewReport}><LiaFileMedicalSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("New Report")}</div>
            {canSave() && <div onClick={onSaveDocument}><LiaFileUploadSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Save Report")}</div>}
            <hr  className="h-separator" />
            <div onClick={onRunReport}><LiaRunningSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Run Report")}</div>
            <hr  className="h-separator" />
            <div onClick={e => onShowQueryDocumentSelect(e)}><LiaCoinsSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Query Document")}</div>
            <hr  className="h-separator" />
            <div onClick={onReportSettings}><LiaWindowRestoreSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Page Settings")}</div>
            <hr className="h-separator" />
            {canUndo() && <div onClick={e => onUndo(e)}><LiaUndoAltSolid   size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Undo Last Change")}</div>}
            {sel && <hr  className="h-separator" />}
            {sel && <div onClick={onSetFont}><AiOutlineFontSize size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Font")}</div>}
            {sel && <div onClick={onSetBorder}><AiOutlineBorder size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Border")}</div>}
            {sel && <hr  className="h-separator" />}
            {sel && <div onClick={e => onTextAlign(LEFT)}><LiaAlignLeftSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Left")}</div>}
            {sel && <div onClick={e => onTextAlign(CENTER)}><LiaAlignCenterSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Center")}</div>}
            {sel && <div onClick={e => onTextAlign(RIGHT)}><LiaAlignRightSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Text Align Right")}</div>}
            {sel && <hr  className="h-separator" />}
            {sel && <div onClick={e => onComponentAlign(LEFT)}><RxAlignLeft size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Left")}</div>}
            {sel && <div onClick={e => onComponentAlign(TOP)}><RxAlignTop size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Top")}</div>}
            {sel && <div onClick={e => onComponentAlign(RIGHT)}><RxAlignRight size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Right")}</div>}
            {sel && <div onClick={e => onComponentAlign(BOTTOM)}><RxAlignBottom size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Component Align Bottom")}</div>}
            {sel && <div onClick={e => onComponentSize(true)}><RxSpaceBetweenVertically size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Size Component Height")}</div>}
            {sel && <div onClick={e => onComponentSize(false)}><RxSpaceBetweenHorizontally size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Size Component Width")}</div>}
        </Menu>;
    };

    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };

    const onShowReportDocumentSelect = async () => {
        closeMenu();
        showMessage(INFO, replaceTokens(getText("Loading available documents", "..."), getText(REPORT_DOCUMENT_TYPE)), null, true);

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
        let userId = authData.currentUser.userId;
        let actionTimestamp = new Date().toISOString();
        let cr = copyObject(currentReport);
        
        if (name !== cr.name) {
            cr.newRecord = true;
        }
        
        cr.name = name;
        cr.documentGroupName = group;
        showMessage(INFO, replaceTokens(getText("Saving document", "..."), [name]), null, true);
        
        let docWrapper = {
            user: userId,
            actionTimestamp: actionTimestamp,
            reportDocument: cr
        };

        let res = await saveDocument(docWrapper);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            showMessage(SUCCESS, replaceTokens(getText("Document saved"), [name]));
            hideShowSave();
            setCurrentReport(res.result.reportDocument);
        }
    };

    const onSaveDocument = async () => {
        closeMenu();
        setShowSaveDocument({show: true, type: REPORT_DOCUMENT_TYPE, saveDocument: saveReportDocument, hide: hideShowSave, currentDocument: currentReport});
    };


    const onNewReport = () => {
        setNewReport();
    };

    const loadDocument = (group, name) => {
        populateDocument(group, name);
    };

    const populateDocument = async (group, name) => {
        hideDocumentSelect();
        showMessage(INFO, getText("Loading report", " " + name + "..."), null, true);

        let res = await getDocument(REPORT_DOCUMENT_TYPE, group, name);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            let doc = res.result;
            let qdoc;
            if (doc.queryDocumentName) {
                qdoc = await loadQueryDocument(doc.queryDocumentGroup, doc.queryDocumentName);
            }
            
            if (!doc.queryDocumentName || qdoc) {
                setNewReport();
                setCurrentComponent(null);
                setLastSelectedIndex(-1);
                if (qdoc) {
                    setCurrentQuery(qdoc);
                } else {
                    setCurrentQuery(null);
                }
                setCurrentReport(doc);
            }

            hideMessage();
        }
    };

    const getReportInfo = () => {
        let gstyle = getComputedStyle(document.documentElement);
        let fcolor = gstyle.getPropertyValue('--default-font-color')
        return  <span className="cobaltBlue-f" style={{marginLeft: "10px"}}>
            <span style={{color: fcolor}}>{getText("Group", ":  ")}</span>
            {currentReport.documentGroupName} 
            <span style={{paddingLeft: "15px", color: fcolor}}>{getText("Report", ":  ")}</span>
            {currentReport.name}
            <span style={{paddingLeft: "15px", color: fcolor}}>{getText("Page Size", ":  ")}</span>
            {currentReport.pageSize}
            <span style={{paddingLeft: "15px", color: fcolor}}>{getText("Query Document", ":  ")}</span>
            {currentReport.queryDocumentName ? currentReport.queryDocumentGroup + ":" + currentReport.queryDocumentName.replace(".json", "") : "-"}
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
                <div className="report-design-tab" style={{top: "40px", width: "100%"}} >
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