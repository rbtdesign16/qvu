package org.rbtdesign.qvu.services;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ReportComponent;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.ReportDocumentRunWrapper;
import org.rbtdesign.qvu.dto.ReportRunWrapper;
import org.rbtdesign.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


/**
 *
 * @author rbtuc
 */
@Service
public class ReportServiceImpl implements ReportService {
    private static final Logger LOG = LoggerFactory.getLogger(ReportServiceImpl.class);
    
    @Autowired
    private MainService mainService;
    
    @PostConstruct
    private void init() {
        LOG.info("in ReportServiceImpl.init()");
    }

    @Override
    public OperationResult<byte[]> generateReport(ReportRunWrapper reportWrapper) {
        OperationResult<byte[]> retval = new OperationResult();
        OperationResult <ReportDocument> res = mainService.getDocument(Constants.DOCUMENT_TYPE_REPORT, reportWrapper.getGroupName(), reportWrapper.getDocumentName());
        
        if (res.isSuccess()) {
            ReportDocumentRunWrapper rw = new ReportDocumentRunWrapper();
            rw.setDocument(res.getResult());
            rw.setParameters(reportWrapper.getParameters());
            retval = generateReport(rw);
        } else {
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
        }
        
        return retval;
    }
    

    @Override
    public OperationResult<byte[]> generateReport(ReportDocumentRunWrapper reportWrapper) {
        OperationResult<QueryResult> qres = null;

        ReportDocument report = reportWrapper.getDocument();
        if (StringUtils.isNotEmpty(report.getQueryDocumentName())) {
            QueryRunWrapper queryWrapper 
                = new QueryRunWrapper(report.getRunUser(), 
                    report.getQueryDocumentGroup(), 
                  report.getQueryDocumentName(), reportWrapper.getParameters());
            
             qres = mainService.runQuery(queryWrapper);
        }
        
        if ((qres == null) || qres.isSuccess()) {
            QueryResult queryResult = null;
            if (qres != null) {
                queryResult = qres.getResult();
            }
            
            String html = generateHtml(report, queryResult);
            
        }
        
 
        return null;
    }
    
    private String generateHtml(ReportDocument report, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        double pageWidth = getReportWidth(report);
        double pageHeight = getReportHeight(report);
        String units = report.getPageUnits().substring(0, 2);
        int pageCount = calculatePageCount(report, queryResult);

        Map<String, SimpleDateFormat> dateFormats = new HashMap<>();
        
        retval.append(getHtmlOpen(report, pageWidth, pageHeight, units));
        List<ReportComponent> headerComponents = new ArrayList<>();
        List<ReportComponent> bodyComponents = new ArrayList<>();
        List<ReportComponent> footerComponents = new ArrayList<>();
      
        for (ReportComponent c : report.getReportComponents()) {
            switch(c.getSection()) {
                case Constants.REPORT_SECTION_HEADER:
                    headerComponents.add(c);
                    break;
                case Constants.REPORT_SECTION_BODY:
                    bodyComponents.add(c);
                    break;
                case Constants.REPORT_SECTION_FOOTER:
                    footerComponents.add(c);
                    break;
            }
        }
        
        for (int i = 0; i < pageCount; ++i) {
            retval.append("\n<div style=\"top: ");
            retval.append(i * pageHeight);
            retval.append(units);
            retval.append(";\" class=\"page\">");
            retval.append(getHeaderHtml(report, queryResult, headerComponents, pageHeight, units, pageCount, i, dateFormats));
            retval.append(getBodyHtml(report, queryResult, bodyComponents, pageHeight, units,  pageCount, i, dateFormats));
            retval.append(getFooterHtml(report, queryResult, footerComponents, pageHeight, units, pageCount, i, dateFormats));
            retval.append("\n</div>");
        }
        
        retval.append(getHtmlClose());
        
        if (LOG.isDebugEnabled()) {
            LOG.debug("------------------ generated html -----------------");
            LOG.debug(retval.toString());
            LOG.debug("--------------------------------- -----------------");
        }
        
        return retval.toString();
    }
    
    private String getComponentValue(ReportDocument report, 
        ReportComponent c, 
        double top, 
        String units, 
        QueryResult queryResult,
        int currentPage, 
        int componentIndex,
        Map<String, SimpleDateFormat> dateFormats) {
        StringBuilder retval = new StringBuilder("");
        
        switch(c.getType()) {
            case Constants.REPORT_COMPONENT_TYPE_TEXT_ID:
                retval.append(c.getValue());
                break;
            case Constants.REPORT_COMPONENT_TYPE_IMAGE_ID:
                retval.append(getImageHtml(c));
                break;
            case Constants.REPORT_COMPONENT_TYPE_SHAPE_ID:
                retval.append(getShapeHtml(c, units, top, componentIndex));
                break;
            case Constants.REPORT_COMPONENT_TYPE_EMAIL_ID:
                retval.append(getEmailHtml(c));
                break;
            case Constants.REPORT_COMPONENT_TYPE_HYPERLINK_ID:
                retval.append(getHyperlinkHtml(c));
                break;
            case Constants.REPORT_COMPONENT_TYPE_PAGE_NUMBER_ID:
                retval.append(getPageNumberHtml(c, currentPage));
                break;
            case Constants.REPORT_COMPONENT_TYPE_CURRENT_DATE_ID:
                retval.append(getCurrentDateHtml(c, dateFormats));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID:
                retval.append(getDataFieldHtml(c, queryResult));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID:
                retval.append(getDataGridHtml(c, queryResult));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID:
                retval.append(getDataRecordHtml(c, queryResult));
                break;
            case Constants.REPORT_COMPONENT_TYPE_CHART_ID:
                break;
            case Constants.REPORT_COMPONENT_TYPE_SUBREPORT_ID:
                break;

        }
        
        
        return retval.toString();
    }
    
    private String getHeaderHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage,
        Map<String, SimpleDateFormat> dateFormats) {
        StringBuilder retval = new StringBuilder();

        double top = pageHeight * currentPage;
        retval.append("\n\t<div class=\"sec-header\">");
        
        // header components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("\n\t\t<div ");
            retval.append("class=\"");
            retval.append("header-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n");
            retval.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx - 1, dateFormats));
            retval.append("\t\t</div>\n");
        }
        
        retval.append("\t</div>\n");
        
        return retval.toString();
     }
    
    private String getBodyHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageHeight, 
        String units, 
        int pageCount,
        int currentPage,
        Map<String, SimpleDateFormat> dateFormats) {
     
        double top = (pageHeight * currentPage) + report.getHeaderHeight();

        StringBuilder retval = new StringBuilder();
        retval.append("\n\t<div class=\"sec-body\">");
        
        // body components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("\n\t\t<div ");
            retval.append("class=\"body-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n");
            retval.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx - 1, dateFormats));
            retval.append("\t\t</div>\n");
        }
        
        retval.append("\t</div>\n");
        
        return retval.toString();
    }
    
    private String getFooterHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage,
        Map<String, SimpleDateFormat> dateFormats) {
        StringBuilder retval = new StringBuilder();
        
        double top = (pageHeight * currentPage) + (pageHeight - report.getFooterHeight());
        retval.append("\n\t<div class=\"sec-footer\" ");
 
                        
        if (pageCount > (currentPage + 1)) {
            retval.append("style=\"break-after: page;\"");
        } 
        
        retval.append(">\n");
        
        // footer components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("\n\t\t<div ");
            retval.append("class=\"footer-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n\t\t\t");
            retval.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx - 1, dateFormats));
            retval.append("\t\t</div>\n");
         }
        
        retval.append("\t</div>\n");
        
        return retval.toString();
    }

    private String getComponentStyle(ReportDocument report, ReportComponent c, double top, String units) {
        StringBuilder retval = new StringBuilder();
        retval.append("style=\"top: ");
        retval.append(c.getTop());
        retval.append(units);
        retval.append(";\"");
               
        return retval.toString();
    }
    
    private boolean isDataGridComponent(ReportComponent c) {
        return Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID.equals(c.getType());
    }
    
    private boolean hasGridComponent(ReportDocument report) {
        boolean retval = false;
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataGridComponent(c)) {
                retval = true;
                break;
            }
        }
        
        return retval;
    }
    
    private double gitDataGridRowSpan(ReportDocument report) {
        double retval = 1.0;
        
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataGridComponent(c)) {
                Map<String, Object> m = (Map<String, Object>)c.getValue();
                String layout = (String)m.get("gridLayout");
                Double drh = (Double)m.get("dataRowHeight");
                Double hrh = (Double)m.get("headerRowHeight");
                
                if (StringUtils.isNotEmpty(layout) && (drh != null) && (drh > 0) && (hrh != null)) {
                    if (((c.getHeight() - hrh) / drh) > retval) {
                        retval = ((c.getHeight() - hrh) / drh);
                    }
                }
            }
        }
        
        return retval;
     }
    
    private int calculatePageCount(ReportDocument report, QueryResult queryResult) {
        int retval = 1;
        
        if (queryResult != null) {
            if (hasGridComponent(report)) {
                retval = (int)Math.floor(queryResult.getRowCount() / gitDataGridRowSpan(report));
            } else {
                retval = queryResult.getRowCount();
            }
        }
        
        return retval;
    }
    
    private String getBorderCss(ReportComponent c) {
        if (c.getBorderSettings() != null) {
            return c.getBorderSettings().getBorderCss();
        } else {
            return "";
        }
    }
    
    private String getFontCss(ReportComponent c) {
        if (c.getFontSettings() != null) {
            return c.getFontSettings().getFontCss();
        } else {
            return "";
        }
    }

    private String getHtmlOpen(ReportDocument report, double pageWidth, double pageHeight, String units) {
        StringBuilder retval = new StringBuilder();

        retval.append("<html>\n<style>\n\tbody {\n\t\tbackground-color: white;\n\t}\n\t.page {\n");
        retval.append("\t\tposition: absolute;\n\t\twidth: ");
        retval.append(pageWidth);
        retval.append(units);
        retval.append(";\n\t\theight: ");
        retval.append(pageHeight);
        retval.append(units);
        retval.append(";\n");
        
        if (System.getProperty("dev.mode") != null) {
            retval.append("\t\tborder: solid 1px blue;\n");
        }
        
        retval.append("\t}\n");
        
        retval.append(getSectionClass(report, "header", units, pageHeight, pageWidth));
        retval.append(getSectionClass(report, "body", units, pageHeight, pageWidth));
        retval.append(getSectionClass(report, "footer", units, pageHeight, pageWidth));
        
        int chindx = 0;
        int cbindx = 0;
        int cfindx=0;
        
        for (int i = 0; i < report.getReportComponents().size(); ++i) {
            ReportComponent c = report.getReportComponents().get(i);
            retval.append("\t.");
            retval.append(c.getSection());
            retval.append("-comp-");
            switch(c.getSection()) {
                case Constants.REPORT_SECTION_HEADER:
                    retval.append(chindx++);
                    break;
                case Constants.REPORT_SECTION_BODY:
                    retval.append(cbindx++);
                    break;
                case Constants.REPORT_SECTION_FOOTER:
                    retval.append(cfindx++);
                    break;
            }
            retval.append(" {\n\t\tleft: ");
            retval.append(c.getLeft());
            retval.append(units);
            retval.append(";\n\t\twidth: ");
            retval.append(c.getWidth());
            retval.append(units);
            retval.append(";\n\t\theight:");
            retval.append(c.getHeight());
            retval.append(units);
            retval.append(";\n\t\tposition: absolute;\n\t\tz-index: 1;\n\t\ttext-align: ");
            retval.append(c.getAlign());
            retval.append(";\n");
            retval.append(getFontCss(c));
            retval.append(getBorderCss(c));
            retval.append("\n\t}\n");
            
            switch(c.getType()) {
                case Constants.REPORT_COMPONENT_TYPE_SHAPE_ID:
                    switch(c.getSection()) {
                        case Constants.REPORT_SECTION_HEADER:
                            retval.append(this.getShapeClass(c, chindx - 1));
                            break;
                        case Constants.REPORT_SECTION_BODY:
                            retval.append(this.getShapeClass(c, cbindx - 1));
                            break;
                        case Constants.REPORT_SECTION_FOOTER:
                            retval.append(this.getShapeClass(c, cfindx - 1));
                             break;
                    }
                    break;
                case Constants.REPORT_COMPONENT_TYPE_IMAGE_ID:
                   switch(c.getSection()) {
                        case Constants.REPORT_SECTION_HEADER:
                            retval.append(this.getImageClass(c, c.getSection() + "-comp-" + (chindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_BODY:
                            retval.append(this.getImageClass(c, c.getSection() + "-comp-" + (cbindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_FOOTER:
                            retval.append(this.getImageClass(c, c.getSection() + "-comp-" + (cfindx - 1)));
                             break;
                    }
                   break;
               case Constants.REPORT_COMPONENT_TYPE_EMAIL_ID:
                   switch(c.getSection()) {
                        case Constants.REPORT_SECTION_HEADER:
                            retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + (chindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_BODY:
                            retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + (cbindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_FOOTER:
                            retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + (cfindx - 1)));
                             break;
                    }
                   break;
               case Constants.REPORT_COMPONENT_TYPE_HYPERLINK_ID:
                   switch(c.getSection()) {
                        case Constants.REPORT_SECTION_HEADER:
                            retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + (chindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_BODY:
                            retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + (cbindx - 1)));
                            break;
                        case Constants.REPORT_SECTION_FOOTER:
                            retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + (cfindx - 1)));
                             break;
                    }
                   break;
            }
        }
        
        retval.append("</style>\n<body>");
        
        return retval.toString();
    }
    
    private String getHtmlClose() {
        return "\n</body>\n</html>";
    }
    
    private String getSectionClass(ReportDocument report, String section, String units, double pageHeight, double pageWidth) {
        StringBuilder retval = new StringBuilder();
        retval.append("\n\t.sec-");
        retval.append(section);
        retval.append(" {\n\t\tposition: absolute;\n\t\toverflow: hidden;\n");
        switch (section) {
            case Constants.REPORT_SECTION_HEADER:
                retval.append("\t\tmargin: ");
                retval.append(report.getPageBorder().get(1));
                retval.append(units);
                retval.append(" ");
                retval.append(+ report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" 0 ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\n\t\ttop: 0;\n\t\twidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(report.getHeaderHeight() - report.getPageBorder().get(1));
                retval.append(units);
                retval.append(";\n");
                break;
            case Constants.REPORT_SECTION_BODY:
                retval.append("\t\tmargin: 0 ");
                retval.append(report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" 0 ");
                retval.append(report.getPageBorder().get(3));
                retval.append(units);
                retval.append(";\n\t\ttop: ");
                retval.append(report.getHeaderHeight());
                retval.append(units);
                retval.append(";\n\t\twidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(pageHeight - (report.getHeaderHeight() + report.getFooterHeight()));
                retval.append(units);
                retval.append(";\n");
               break;
            case Constants.REPORT_SECTION_FOOTER:
                retval.append("\t\tmargin: ");
                retval.append("0 ");
                retval.append(report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" ");
                retval.append(report.getPageBorder().get(3));
                retval.append(units);
                retval.append(" ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\n\t\ttop: ");
                retval.append(pageHeight - report.getFooterHeight());
                retval.append(units);
                retval.append(";\n\t\twidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(report.getFooterHeight() - report.getPageBorder().get(3));
                retval.append(units);
                retval.append(";\n");
                break;
        }
        
        retval.append("\t}\n");

        return retval.toString();
    };
    
    private double getReportWidth(ReportDocument report) {
        double retval = 0;
        double[] size = Constants.PAGE_SIZE_MAP.get(report.getPageSize());
     
        if (Constants.PAGE_ORIENTATION_LANDSCAPE.equals(report.getPageOrientation())) {
            if (Constants.PAGE_UNITS_MM.equals(report.getPageUnits())) {
                retval = size[1];
            } else {
                retval = size[3];
            }
        } else {
            if (Constants.PAGE_UNITS_MM.equals(report.getPageUnits())) {
                retval = size[0];
            } else {
                retval = size[2];
            }
        }
        
        return retval;
    }
    
    private double getReportHeight(ReportDocument report) {
        double retval = 0;
        double[] size = Constants.PAGE_SIZE_MAP.get(report.getPageSize());
     
        if (Constants.PAGE_ORIENTATION_LANDSCAPE.equals(report.getPageOrientation())) {
            if (Constants.PAGE_UNITS_MM.equals(report.getPageUnits())) {
                retval = size[0];
            } else {
                retval = size[2];
            }
        } else {
            if (Constants.PAGE_UNITS_MM.equals(report.getPageUnits())) {
                retval = size[1];
            } else {
                retval = size[3];
            }
        }
        
        return retval;
    }
    
    private String getImageClass(ReportComponent c, String parentClass) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        
        Boolean sizeToFit = getBooleanMapValue("sizetofit", m);
        String linkurl = getStringMapValue("linkurl", m);
        
        if (sizeToFit) {
            retval.append("\t.");
            retval.append(parentClass);
            retval.append(" a {\n\t\twidth: 100%;\n\t\theight: 100%;");
        }
            
        if (StringUtils.isNotEmpty(linkurl)) {
            if (retval.isEmpty()) {
                retval.append(parentClass);
                retval.append(" a {\t\tcursor: pointer;\n");
            } else {
                retval.append("\t\tcursor: pointer;\n");
            }
        }
 
        if (!retval.isEmpty()) {
            retval.append("\t}\n");
        }
        
        String s = retval.toString();
        
        retval.append(s.replace(" a {", " img {"));
        
        return retval.toString();
    }
    
    private String getImageHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        
        String linkurl = getStringMapValue("linkurl", m);
        String url = getStringMapValue("url", m);
        String alttext = getStringMapValue("alttext", m);
        
       if (StringUtils.isNotEmpty(linkurl)) {
            retval.append("\t\t\t<a href=\"");
            retval.append(linkurl);
            retval.append("\" target=\"_blank\"><img ");
            
            if (StringUtils.isNotEmpty(alttext)) {
                retval.append(" alt=\"");
                retval.append(alttext);
                retval.append("\" src=\"");
                retval.append(url);
                retval.append("\" /></a>");
            }
        } else {
            retval.append("\t\t\t<img ");
            
            if (StringUtils.isNotEmpty(alttext)) {
                retval.append("alt=\"");
                retval.append(alttext);
                retval.append("\" ");
            }
            retval.append(" src=\"");
            retval.append(url);
            retval.append("\"/>\n");
        }
        
        return retval.toString();
    }
    
    private String getShapeHtml(ReportComponent c, String units, double top, int indx) {
        StringBuilder retval = new StringBuilder();
        
        retval.append("\t\t\t<div class=\"");
        retval.append(c.getSection());
        retval.append("-shape-");
        retval.append(indx);
        retval.append("\" style=\"top: ");
        retval.append(top + c.getTop());
        retval.append(units);
        retval.append("\"></div>");
        
        return retval.toString();
    }
    
    private String getShapeClass(ReportComponent c, int indx) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String shape = getStringMapValue("shape", m);
        Boolean wantborder = getBooleanMapValue("wantborder", m);
        Boolean wantfilled = getBooleanMapValue("wantfilled", m);
        String borderColor = getStringMapValue("bordercolor", m);
        String border = getStringMapValue("border", m);
        String fillColor = getStringMapValue("fillcolor", m);
        String width = getStringMapValue("width", m);
        String opacity = getStringMapValue("opacity", m);
        
        retval.append("\t.");
        retval.append(c.getSection());
        retval.append("-shape-");
        retval.append(indx);
        retval.append(" {\n");
        if (Constants.SHAPE_HORIZONTAL_LINE.equals(shape)
            || (Constants.SHAPE_VERTICAL_LINE.equals(shape))) {
                retval.append("\t\tbackground-color: ");
                retval.append(fillColor);
                retval.append(";\n\t\tposition absolute;\n");
                if (Constants.SHAPE_HORIZONTAL_LINE.equals(shape)) {
                    retval.append("\t\twidth: 100%;]n\t\theight: ");
                    retval.append(width);
                    retval.append("px;\n\t\ttop: 50%;\n");
                } else {
                    retval.append("\t\twidth: ");
                    retval.append(width);
                    retval.append("px;\n\t\theight: 100%;\n\t\tmargin-left: 50%;\n");
                }
            
        } else {
            retval.append("\t\theight: 100%;\n\t\twidth: 100%;\n");

            if (wantborder) {
                retval.append("\t\tborder: ");
                retval.append(border);
                retval.append(" ");
                retval.append(width);
                retval.append("px ");
                retval.append(borderColor);
                retval.append(";\n");
            } 

            if (StringUtils.isNotEmpty(opacity)) {
                retval.append("\t\topacity: ");
                retval.append(opacity);
                retval.append(";\n");
            }

            if (wantfilled) {
                retval.append("\t\tbackground-color: ");
                retval.append(fillColor);
                retval.append(";\n");
            } else {
                retval.append("background-color: transparent;");
            }

            switch (shape) {
                case Constants.SHAPE_ELLIPSE:
                    retval.append("\t\tborder-radius: 50%;\n");
                    break;
                case Constants.SHAPE_ROUNDED_RECTANGLE:
                    retval.append("\t\tborder-radius: ");
                    retval.append(Constants.DEFAULT_BORDER_RADIUS);
                    retval.append(";\n");
                    break;
            }
            
            retval.append("\t}\n");
        }
        
        return retval.toString();
    }
    
    private String getEmailClass(ReportComponent c, String parentClass) {
        StringBuilder retval = new StringBuilder("");
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        Boolean underline = getBooleanMapValue("underline", m);
        if ((underline == null) || !underline) {
            retval.append("\t.");
            retval.append(parentClass);
            retval.append(" a {\n");
            retval.append("\t\ttext-decoration: none;\n\t}\n");
        }
        
        return retval.toString();
    }
    
    private String getEmailHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String subject = getStringMapValue("subject", m);
        String to = getStringMapValue("to", m);
        String text = getStringMapValue("text", m);
        
        retval.append("\t\t\t<a ");
        retval.append("href=\"mailto:");
        retval.append(to);
        if (StringUtils.isNotEmpty(subject)) {
            retval.append("?\nsubject=");
            retval.append(subject);
            retval.append("\" _target=\"_blank\">");
            retval.append(text);
            retval.append("</a>\n");
        }
        
        return retval.toString();
    }
    
    private String getHyperlinkClass(ReportComponent c, String parentClass) {
        StringBuilder retval = new StringBuilder("");
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        Boolean underline = getBooleanMapValue("underline", m);
        if ((underline == null) || !underline) {
            retval.append("\t.");
            retval.append(parentClass);
            retval.append(" a {\n");
            retval.append("\t\ttext-decoration: none;\n\t}\n");
        }
        
        return retval.toString();
    }
 
    private String getHyperlinkHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String text = getStringMapValue("text", m);
        String url = getStringMapValue("url", m);
        retval.append("\t\t\t<a ");
        
        retval.append("href=\"");
        retval.append(url);
        retval.append(" target=\"_blank\">");
        retval.append(text);
        retval.append("</a>\n");
        
        return retval.toString();
    }

    private String getPageNumberHtml(ReportComponent c, int currentPage) {
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String format = getStringMapValue("format", m);
        return format.replace("?", "" + (currentPage + 1));
    }

    private String getCurrentDateHtml(ReportComponent c, Map<String, SimpleDateFormat> dateFormats) {
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String format = getStringMapValue("format", m);
        
        SimpleDateFormat df = dateFormats.get(format);
        if (df == null) {
            dateFormats.put(format, df = new SimpleDateFormat(format));
        }
        
        return df.format(new Date());
    }

    private String getDataFieldHtml(ReportComponent c, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        return retval.toString();
    }
 
    private String getDataGridHtml(ReportComponent c, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        return retval.toString();
    }

    private String getDataRecordHtml(ReportComponent c, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        return retval.toString();
    }
    
    private Boolean getBooleanMapValue(String key, Map<String, Object> m) {
        Boolean retval = false;
        
        if (m.containsKey(key)) {
            String s = m.get(key).toString();
            retval = "true".equals(s);
        }
        
        return retval;
    
    }

    private String getStringMapValue(String key, Map<String, Object> m) {
        String retval = null;
        
        if (m.containsKey(key)) {
            retval = m.get(key).toString();
        }
        
        return retval;
    
    }

}
