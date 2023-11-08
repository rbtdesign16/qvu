import React, { useState, useEffect }from "react";
import ReportRuler from "./ReportRuler";
import Button from "react-bootstrap/Button"
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
import {SUCCESS, WARN, INFO, ERROR, REPORT_DOCUMENT_TYPE} from "../../utils/helper";
import {getReportSettings, isApiError} from "../../utils/apiHelper";
import { isQueryDesigner, isReportDesigner } from "../../utils/authHelper";

const ReportDesign = () => {
    const [report, setReport] = useState(null);
    const {getText} = useLang();
    const [showSaveDocument, setShowSaveDocumnt] = useState({show: false, type: REPORT_DOCUMENT_TYPE});
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

    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };

    const onShowDocumentSelect = async () => {
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
    };

    const onSaveDocument = async () => {
        setShowSaveDocument({show: true, type: REPORT_DOCUMENT_TYPE, saveDocument: saveReportDocument, hide: hideShowSave, currentDocument: currentDocument});
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

    useEffect(() => {
        if (!reportSettings) {
            loadReportSettings();
        }
    });

    if (reportSettings && currentReport) {
        return (
                <div>
                    <SaveDocumentModal config={showSaveDocument}/>
                    <DocumentSelectModal config={showDocumentSelect}/>
                    <Button size="sm"  title={getText("Load Report")} style={{marginLeft: "5px", marginBottom: "2px"}} onClick={() => onShowDocumentSelect()}>{getText("Load")}</Button>
                    {isReportDesigner(authData) && <Button size="sm"  title={getText("Save Report")}  style={{marginLeft: "5px", marginBottom: "2px"}} disabled={!isSaveEnabled()} onClick={() => onSaveDocument()}>{getText("Save")}</Button>}
                    <Button size="sm"  title={getText("New Report")} style={{marginLeft: "5px", marginBottom: "2px"}} onClick={() => onNewReport()}>{getText("New")}</Button>
                    {getReportInfo()}
                    <div>
                        <ReportRuler type="hor" report={currentReport}/>
                        <ReportRuler type="ver" report={currentReport}/>
                        report design
                    </div>
                </div>
                );
    } else {
        return <div></div>;
    }
};

export default ReportDesign;