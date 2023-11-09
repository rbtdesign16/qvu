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
    SMALL_ICON_SIZE
} from "../../utils/helper";
import {
    getReportSettings, 
    getAvailableDocuments,
    isApiError,
    isApiSuccess
} from "../../utils/apiHelper";
import { isQueryDesigner, isReportDesigner } from "../../utils/authHelper";
import { LiaFileInvoiceSolid, LiaFileMedicalSolid, LiaFileUploadSolid } from "react-icons/lia";

const ReportDesign = () => {
    const [report, setReport] = useState(null);
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
    
    const getMenu = () => {
        return <Menu isOpen={menuOpen} 
            onStateChange={(state) => handleStateChange(state)}>
            <div onClick={onShowDocumentSelect}><LiaFileInvoiceSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Load Report")}</div>
            <div onClick={onNewReport}><LiaFileMedicalSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("New Report")}</div>
            {canSave() && <div onClick={onSaveDocument}><LiaFileUploadSolid size={SMALL_ICON_SIZE} className="icon cobaltBlue-f"/>{getText("Save Report")}</div>}
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
        
        let myStyle =  {
            display: "grid",
            gridTemplateColumns: "30px " + width + "px",
            margin: "5px",
            gridRowGap: 0
        };

        return (
                <div style={{top: "40px"}} className="report-design-tab">
                    <SaveDocumentModal config={showSaveDocument}/>
                    <DocumentSelectModal config={showDocumentSelect}/>
                    {getReportInfo()}
                    <div style={myStyle}>
                    <div className="bm-container">{getMenu()}</div>
                    <ReportRuler type={HORIZONTAL_KEY} report={currentReport} height={30} width={width}/>
                    <ReportRuler type={VERTICAL_KEY} report={currentReport}  height={height} width={30}/>
                    <div>report design</div>
                    </div>
                </div>
                );
    } else {
        return <div></div>;
    }
};

export default ReportDesign;