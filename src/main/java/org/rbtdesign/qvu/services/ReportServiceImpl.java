package org.rbtdesign.qvu.services;

import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ReportDocument;
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
    public OperationResult<byte[]> generateReport(String user, String group, String name) {
        OperationResult<byte[]> retval = new OperationResult();
        OperationResult <ReportDocument> res = mainService.getDocument(Constants.DOCUMENT_TYPE_REPORT, group, name);
        
        if (res.isSuccess()) {
            retval = generateReport(res.getResult());
        } else {
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
        }
        
        return retval;
    }
    

    @Override
    public OperationResult<byte[]> generateReport(ReportDocument report) {
        OperationResult<QueryResult> qres = null;
        
        if (StringUtils.isNotEmpty(report.getQueryDocumentName())) {
            QueryRunWrapper queryWrapper 
                = new QueryRunWrapper(report.getUser(), 
                    report.getQueryDocumentGroup(), 
                  report.getQueryDocumentName(), null);
            
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
            retval.append(getHeaderHtml(report, queryResult, i+1));
            retval.append(getBodyHtml(report, queryResult, i + 1));
            retval.append(getFooterHtml(report, queryResult, i + 1));
        }
        
        retval.append(getHtmlClose());
        
        return retval.toString();
    }
    
    private String getHeaderHtml(ReportDocument report, QueryResult queryResult, int page) {
        StringBuilder retval = new StringBuilder();

        retval.append("<div class=\"sec-header\">");
        
        
        retval.append("</div>");
        
        return retval.toString();
     }
    
    private String getBodyHtml(ReportDocument report, QueryResult queryResult, int page) {
        StringBuilder retval = new StringBuilder();
        retval.append("<div class=\"sec-body\">");
        
        
        retval.append("</div>");
        return retval.toString();
    }
    
    private String getFooterHtml(ReportDocument report, QueryResult queryResult, int page) {
        StringBuilder retval = new StringBuilder();
        retval.append("<div class=\"sec-footer\">");
        
        
        retval.append("</div>");
        
        return retval.toString();
    }

    private int calculatePageCount(ReportDocument report, QueryResult queryResult) {
        return 1;
    }
    
    
    private String getHtmlOpen(ReportDocument report) {
        StringBuilder retval = new StringBuilder();
        retval.append("<html><style>\n@page {  size: ");
        retval.append(report.getPageSize());
        
        if (Constants.PAGE_ORIENTATION_LANDSCAPE.equals(report.getPageOrientation())) {
            retval.append(" ");
            retval.append(Constants.PAGE_ORIENTATION_LANDSCAPE);
        }
        
        retval.append(";}\n");
        retval.append(getSectionClass(report, "header"));
        retval.append(getSectionClass(report, "body"));
        retval.append(getSectionClass(report, "footer"));
        retval.append("</style><body><div>");
        
        
        return retval.toString();
    }
    
    private String getHtmlClose() {
        return "</div></body></html>";
    }
    
    private String getSectionClass(ReportDocument report, String section) {
        StringBuilder retval = new StringBuilder();
        String units = report.getPageUnits().substring(0, 2);
        retval.append(".sec-");
        retval.append(section);
        retval.append("{\nposition: relative;\noverflow: hidden;");
        double width = getReportWidth(report);
        double height = getReportHeight(report);
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
