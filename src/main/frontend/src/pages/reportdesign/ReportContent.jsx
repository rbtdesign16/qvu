import React from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useReportDesign from "../../context/ReportDesignContext";
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
        } = useReportDesign();
    const reportWidth = getReportWidth(currentReport, reportSettings);
    const reportHeight = getReportHeight(currentReport, reportSettings);
    const reportWidthPixels = getReportWidthInPixels(currentReport, reportSettings);
    const reportHeightPixels = getReportHeightInPixels(currentReport, reportSettings);

    const getStyle = () => {
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
        r.headerHeight = reportHeight * (e.sizes[0]/100);
        r.footerHeight = reportHeight * (e.sizes[2]/100);
        setCurrentReport(r);
    };


    return <div style={getStyle()} className="report-content">
        <Splitter style={{border: "none", 
            width: (reportWidthPixels - 1) + "px", 
            height: (reportHeightPixels - 1) + "px"}} 
            layout="vertical"
            gutterSize={SPLITTER_GUTTER_SIZE / 2}
            onResizeEnd={e => onResize(e)}>
            <SplitterPanel style={{overflow: "hidden"}} size={getHeaderHeightPercent()} minSize={0}>
                <ReportSection section={REPORT_SECTION_HEADER}/>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}}  size={getBodyHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_BODY}/>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}} size={getFooterHeightPercent()}  minSize={0}>
                <ReportSection section={REPORT_SECTION_FOOTER}/>
            </SplitterPanel>
        </Splitter></div>;
};

export default ReportContent;