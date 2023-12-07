package org.rbtdesign.qvu.services;

import java.util.ArrayList;
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
            
            if (LOG.isDebugEnabled()) {
                LOG.debug("------------------ generated html -----------------");
                LOG.debug(html);
                LOG.debug("--------------------------------- -----------------");
            }
        }
        
 
        return null;
    }
    
    private String generateHtml(ReportDocument report, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        double pageWidth = getReportWidth(report);
        double pageHeight = getReportHeight(report);
        String units = report.getPageUnits().substring(0, 2);
        int pageCount = calculatePageCount(report, queryResult);

        retval.append(getHtmlOpen(report, pageWidth, pageHeight, units, pageCount));
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
            retval.append("\n<div class=\"page\">");
            retval.append(getHeaderHtml(report, queryResult, headerComponents, pageWidth, pageHeight, units, pageCount, i));
            retval.append(getBodyHtml(report, queryResult, bodyComponents, pageWidth, pageHeight, units, pageCount, i));
            retval.append(getFooterHtml(report, queryResult, footerComponents, pageWidth, pageHeight, units, pageCount, i));
            retval.append("\n</div>");
        }
        
        retval.append(getHtmlClose());

        
        if (LOG.isDebugEnabled()) {
            LOG.debug(retval.toString());
        }
        
        
        return retval.toString();
    }
    
    private String getHeaderHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageWidth, 
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage) {
        StringBuilder retval = new StringBuilder();

        double top = pageHeight * currentPage;
        retval.append("\n<div style=\"");
        retval.append("top: ");
        retval.append(top);
        retval.append(units);
        retval.append(";\" class=\"sec-header\">");
        
        // header components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("<div ");
            retval.append("class=\"");
            retval.append("header-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n");
            
            retval.append("</div>\n");
        }
        
        retval.append("</div>\n");
        
        return retval.toString();
     }
    
    private String getBodyHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageWidth, 
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage) {
     
        double top = (pageHeight * currentPage) + report.getHeaderHeight();

        StringBuilder retval = new StringBuilder();
        retval.append("\n<div style=\"");
        retval.append("top: ");
        retval.append(top);
        retval.append(units);
        retval.append(";\" class=\"sec-body\">");
        
        // body components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("<div ");
            retval.append("class=\"");
            retval.append("body-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n");
            
            retval.append("</div>\n");
        }
        
        retval.append("</div>\n");
        
        return retval.toString();
    }
    
    private String getFooterHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageWidth, 
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage) {
        StringBuilder retval = new StringBuilder();
        
        double top = (pageHeight * currentPage) + (pageHeight - report.getFooterHeight());
        retval.append("\n<div style=\"");
        retval.append("top: ");
        retval.append(top);
        retval.append(units);
 
                        
        if (pageCount > (currentPage + 1)) {
            retval.append("; break-after: page\"");
        } 
        
        retval.append(" class=\"sec-footer\">");
        
        // footer components
        int cindx = 0;
        for (ReportComponent c : components) {
            retval.append("<div ");
            retval.append("class=\"");
            retval.append("footer-comp-");
            retval.append(cindx++);
            retval.append("\" ");
            retval.append(getComponentStyle(report, c, top, units));
            retval.append(">\n");
            
            retval.append("</div>\n");
         }
        
        retval.append("</div>\n");
        
        return retval.toString();
    }

    private String getComponentStyle(ReportDocument report, ReportComponent c, double top, String units) {
        StringBuilder retval = new StringBuilder();
        retval.append("style=\" top: ");
        retval.append(top + c.getTop());
        retval.append(units);
               
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

    private String getHtmlOpen(ReportDocument report, double pageWidth, double pageHeight, String units, int pageCount) {
        StringBuilder retval = new StringBuilder();

        retval.append("<html>\n<style>\nbody {\nbackground-color: white;\n}\n.page {");
        retval.append("position: absolute;\nwidth: ");
        retval.append(pageWidth);
        retval.append(units);
        retval.append(";\nheight: ");
        retval.append(pageHeight);
        retval.append(units);
        retval.append(";\n}");
        
        retval.append(getSectionClass(report, "header", units, pageHeight, pageWidth));
        retval.append(getSectionClass(report, "body", units, pageHeight, pageWidth));
        retval.append(getSectionClass(report, "footer", units, pageHeight, pageWidth));
        
        int chindx = 0;
        int cbindx = 0;
        int cfindx=0;
        
        for (int i = 0; i < report.getReportComponents().size(); ++i) {
            ReportComponent c = report.getReportComponents().get(i);
            retval.append(".");
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
            retval.append(" {\nleft: ");
            retval.append(report.getPageBorder().get(0) + c.getLeft());
            retval.append(units);
            retval.append("; width: ");
            retval.append(c.getWidth());
            retval.append(units);
            retval.append("; height:");
            retval.append(c.getHeight());
            retval.append(units);
            retval.append(getFontCss(c));
            retval.append(getBorderCss(c));
            retval.append(";\n}\n");
        }
        
        retval.append("</style>\n<body>");
        
        return retval.toString();
    }
    
    private String getHtmlClose() {
        return "\n</body>\n</html>";
    }
    
    private String getSectionClass(ReportDocument report, String section, String units, double pageHeight, double pageWidth) {
        StringBuilder retval = new StringBuilder();
        retval.append(".sec-");
        retval.append(section);
        retval.append("{\nposition: relative;\noverflow: hidden;");
        switch (section) {
            case Constants.REPORT_SECTION_HEADER:
                retval.append("\nmargin: ");
                retval.append(report.getPageBorder().get(1));
                retval.append(units);
                retval.append(" ");
                retval.append(+ report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" 0 ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\nleft: ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\nwidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\nheight: ");
                retval.append(report.getHeaderHeight() - report.getPageBorder().get(1));
                retval.append(units);
                retval.append(";\n");
                break;
            case Constants.REPORT_SECTION_BODY:
                retval.append("margin: 0 ");
                retval.append(report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" 0 ");
                retval.append(report.getPageBorder().get(3));
                retval.append(units);
                retval.append(";\nleft: ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\nwidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n");
                retval.append("height: ");
                retval.append(pageHeight - (report.getHeaderHeight() + report.getFooterHeight()));
                retval.append(units);
                retval.append(";\n");
               break;
            case Constants.REPORT_SECTION_FOOTER:
                retval.append("margin: ");
                retval.append("0 ");
                retval.append(report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" ");
                retval.append(report.getPageBorder().get(3));
                retval.append(units);
                retval.append(" ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\nleft: ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\nwidth: ");
                retval.append(pageWidth - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n");
                retval.append("height: ");
                retval.append(pageHeight - report.getPageBorder().get(3));
                retval.append(units);
                retval.append(";\n");
                break;
        }
        
        retval.append("}\n");

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
}
