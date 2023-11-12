import React from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useReportDesign from "../../context/ReportDesignContext";
import {
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    reportUnitsToPixels,
    pixelsToReportUnits
    } from "../../utils/helper";

const ReportComponent = (props) => {
    const {component} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport
        } = useReportDesign();

    const getStyle = () => {
        let unit = "in";
        if (currentReport.pageUnits === REPORT_UNITS_MM) {
            unit = "mm";;
        }

        return {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit
        };
    };

    return <div style={getStyle()} 
        onClick={e => onClick(e)} className="report-component"></div>;
};

export default ReportComponent;