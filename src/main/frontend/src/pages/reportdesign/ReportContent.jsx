import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import PropTypes from "prop-types";
import {
REPORT_ORIENTATION_LANDSCAPE,
        REPORT_ORIENTATION_PORTRAIT,
        REPORT_UNITS_INCH,
        REPORT_UNITS_MM,
        SPLITTER_GUTTER_SIZE,
        getReportHeightInPixels,
        getReportWidthInPixels,
        getReportHeight,
        getReportWidth,
        reportUnitsToPixels,
        pixelsToReportUnits
        } from "../../utils/helper";

const ReportContent = (props) => {
    const {report, reportSettings, updateReport} = props;
    const reportWidthPixels = getReportWidthInPixels(report, reportSettings);
    const reportHeightPixels = getReportHeightInPixels(report, reportSettings);
    const reportWidth = getReportWidth(report, reportSettings);
    const reportHeight = getReportHeight(report, reportSettings);

    const getStyle = () => {
        let width;
        let height;
        if (report.pageUnits === REPORT_UNITS_INCH) {
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
        let h = reportUnitsToPixels(report.pageUnits, report.headerHeight);
        return Math.max((100.0 * (h / reportHeightPixels)));
    };

    const getBodyHeightPercent = () => {
        let h = reportUnitsToPixels(report.pageUnits, reportHeight - (report.headerHeight + report.footerHeight));
        return Math.min(100, (100.0 * (h / reportHeightPixels)));
    };

    const getFooterHeightPercent = () => {
        let h = reportUnitsToPixels(report.pageUnits, report.footerHeight);
        return Math.max(0, (100.0 * (h / reportHeightPixels)));
    };

    const onResize = (e) => {
        let r = {...report};
        r.headerHeight = Math.max(0, pixelsToReportUnits(r.pageUnits, e.sizes[0]));
        r.footerHeight = Math.max(0, pixelsToReportUnits(r.pageUnits, e.sizes[2]));
        updateReport(r);
    };


    return <div style={getStyle()} className="report-content">
        <Splitter style={{border: "none", 
            width: (reportWidthPixels - 1) + "px", 
            height: (reportHeightPixels - 1) + "px"}} 
            layout="vertical"
            gutterSize={SPLITTER_GUTTER_SIZE / 2}
            onResizeEnd={e => onResize(e)}>
            <SplitterPanel style={{overflow: "hidden"}} size={getHeaderHeightPercent()} minSize={0}>
                <div>header</div>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}}  size={getBodyHeightPercent()}  minSize={0}>
                <div>body</div>
            </SplitterPanel>
            <SplitterPanel style={{overflow: "hidden"}} size={getFooterHeightPercent()}  minSize={0}>
                <div>footer</div>
            </SplitterPanel>
        </Splitter></div>;
};


ReportContent.propTypes = {
    report: PropTypes.object.isRequired,
    reportSettings: PropTypes.object.isRequired
};


export default ReportContent;