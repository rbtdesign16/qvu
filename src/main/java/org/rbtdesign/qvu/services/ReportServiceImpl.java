package org.rbtdesign.qvu.services;

import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
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
        
        retval.append(getHtmlOpen(report));
        
        int pageCount = calculatePageCount(report, queryResult);
      
        for (int i = 0; i < pageCount; ++i) {
            retval.append("\n<div class=\"page\">");
            retval.append(getHeaderHtml(report, queryResult, i+1));
            retval.append(getBodyHtml(report, queryResult, i + 1));
            retval.append(getFooterHtml(report, queryResult, i + 1, pageCount));
            retval.append("\n</div>");
        }
        
        retval.append(getHtmlClose());

        
        if (LOG.isDebugEnabled()) {
            LOG.debug(retval.toString());
        }
        
        
        return retval.toString();
    }
    
    private String getHeaderHtml(ReportDocument report, QueryResult queryResult, int page) {
        StringBuilder retval = new StringBuilder();

        retval.append("\n<div class=\"sec-header\">this is the header");
        
        
        retval.append("</div>");
        
        return retval.toString();
     }
    
    private String getBodyHtml(ReportDocument report, QueryResult queryResult, int page) {
        StringBuilder retval = new StringBuilder();
        retval.append("\n<div class=\"sec-body\">this is the body");
        
        
        retval.append("</div>");
        return retval.toString();
    }
    
    private String getFooterHtml(ReportDocument report, QueryResult queryResult, int page, int pageCount) {
        StringBuilder retval = new StringBuilder();
        
                        
        if (pageCount > page) {
            retval.append("\n<div style=\"break-after: page\" class=\"sec-footer\">this is the footer");
        } else {
            retval.append("\n<div class=\"sec-footer\">this is the footer");
        }
        
        retval.append("</div>");
        
        return retval.toString();
    }

    private int calculatePageCount(ReportDocument report, QueryResult queryResult) {
        return 1;
    }
    
    
    private String getHtmlOpen(ReportDocument report) {
        StringBuilder retval = new StringBuilder();

        double width = getReportWidth(report);
        double height = getReportHeight(report);
        String units = report.getPageUnits().substring(0, 2);


        retval.append("<html>\n<style>\nbody {\nbackground-color: white;\n}\n.page {");
        retval.append("position: absolute;\nwidth: ");
        retval.append(width);
        retval.append(units);
        retval.append(";\nheight: ");
        retval.append(height);
        retval.append(units);
        retval.append(";\n}");
        
        retval.append(getSectionClass(report, "header", units, height, width));
        retval.append(getSectionClass(report, "body", units, height, width));
        retval.append(getSectionClass(report, "footer", units, height, width));
        retval.append("</style>\n<body>");
        
        return retval.toString();
    }
    
    private String getHtmlClose() {
        return "\n</body>\n</html>";
    }
    
    private String getSectionClass(ReportDocument report, String section, String units, double height, double width) {
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
                retval.append(";\n");
                retval.append("width: ");
                retval.append(width - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n");
                retval.append("height: ");
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
                retval.append(";\n");
                retval.append("width: ");
                retval.append(width - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n");
                retval.append("height: ");
                retval.append(height - (report.getHeaderHeight() + report.getFooterHeight()));
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
                retval.append(";\n");
                retval.append("width: ");
                retval.append(width - (report.getPageBorder().get(0) + report.getPageBorder().get(2)));
                retval.append(units);
                retval.append(";\n");
                retval.append("height: ");
                retval.append(height - report.getPageBorder().get(3));
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
