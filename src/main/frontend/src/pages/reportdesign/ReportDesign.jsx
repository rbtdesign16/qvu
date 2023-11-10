import React, { useState, useEffect }from "react";
import ReportRuler from "./ReportRuler";
import Button from "react-bootstrap/Button"
import { slide as Menu } from "react-burger-menu";
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useAuth from "../../context/AuthContext";
import useReportDesign from "../../context/ReportDesignContext";
import SaveDocumentModal from "../../widgets/SaveDocumentModal";
import DocumentSelectModal from "../../widgets/DocumentSelectModal";
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
        getReportWidth,
        getReportHeight,
        SMALL_ICON_SIZE,
        LEFT,
        TOP,
        RIGHT,
        CENTER,
        BOTTOM
        } from "../../utils/helper";
import {
getReportSettings,
        getAvailableDocuments,
        isApiError,
        isApiSuccess
        } from "../../utils/apiHelper";
import { isQueryDesigner, isReportDesigner } from "../../utils/authHelper";
import {AiOutlineFontSize,
        AiOutlineBarChart,
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
    const [report, setReport] = useState(null);
    const [selectedComponents, setSelectComponent] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const {getText} = useLang();
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
        initializeReportSettings} = useReportDesign();

    const handleStateChange = (state) => {
        setMenuOpen(state.isOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const canSave = () => {
        return isReportDesigner(authData);
    };

    const onAddComponent = () => {
        closeMenu();
    };

    const onTextAlign = (align) => {
    };

    const haveSelectedComponents = () => {
        return (selectedComponents && (selectedComponents.length > 0));
    };

    const onSetFont = () => {
        closeMenu();
    };

    const onAddChart = () => {
        closeMenu();
    };

    const onComponentAlign = (align) => {
        closeMenu();
    };

    const onReportSettings = () => {
        closeMenu();
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
    <div onClick={onReportSettings}><LiaWindowRestoreSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Report Settings")}</div>
    <hr  style={{cursor: "none"}} />
    <div onClick={onAddComponent}><LiaThListSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Add Component")}</div>
    <div onClick={onAddChart}><AiOutlineBarChart size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Add Chart")}</div>
    {sel && <div onClick={onSetFont}><AiOutlineFontSize size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Set Font")}</div>}
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
                newRecord: false
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
        let height = getReportHeight(currentReport, reportSettings);
        let width = getReportWidth(currentReport, reportSettings);

        return (
                <div style={{top: "40px", width: "100%"}} className="report-design-tab">
                    <SaveDocumentModal config={showSaveDocument}/>
                    <DocumentSelectModal config={showDocumentSelect}/>
                    {getReportInfo()}
                    <div style={{width: "100%", height: "calc(100% - 60px)", overflow: "auto"}} >
                        <div className="bm-container">{getMenu()}</div>
                        <ReportRuler type={HORIZONTAL_KEY} report={currentReport} height={30} width={width}/>
                        <ReportRuler type={VERTICAL_KEY} report={currentReport}  height={height} width={30}/>
                        <div style={{top: -height + "px", width: width + "px", height: height + "px"}} className="report-content">
                        </div>
                    </div>
                </div>
                );
    } else {
        return <div></div>;
    }
};

export default ReportDesign;