import React, { useState }from "react";
import ReportRuler from "./ReportRuler";
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useReportDesign from "../../context/ReportDesignContext";
import PropTypes from "prop-types";

const ReportDesign = () => {
    const [report, setReport] = useState(null);
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const {currentDocument, setCurrentDocument} = useReportDesign();

    if (currentDocument) {
        return (
                <div>
                    <ReportRuler type="hor" report={currentDocument}/>
                    <ReportRuler type="ver" report={currentDocument}/>
                    report design
                </div>
                );
    } else {
        return <div></div>;
    }
};

export default ReportDesign;