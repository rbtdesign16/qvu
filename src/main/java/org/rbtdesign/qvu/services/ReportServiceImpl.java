package org.rbtdesign.qvu.services;

import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.QueryDocumentRunWrapper;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.ReportComponent;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.ReportDocumentRunWrapper;
import org.rbtdesign.qvu.dto.ReportRunWrapper;
import org.rbtdesign.qvu.dto.SqlSelectColumn;
import org.rbtdesign.qvu.util.Constants;
import org.rbtdesign.qvu.util.FileHandler;
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
    
    @Autowired
    private FileHandler fileHandler;

    
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
        OperationResult<byte[]> retval = new OperationResult();
        OperationResult<QueryResult> qres = null;
        Map <String, Integer> queryColumnIndexMap = new HashMap<>();
        
        ReportDocument report = reportWrapper.getDocument();
        if (StringUtils.isNotEmpty(report.getQueryDocumentName())) {
            OperationResult <QueryDocument> dres = fileHandler.getQueryDocument(report.getQueryDocumentGroup(), report.getRunUser(), report.getQueryDocumentName());
            
            if (dres.isSuccess()) {
                QueryDocument qdoc = dres.getResult();
                
                int indx = 0;
                for (SqlSelectColumn sc : qdoc.getSelectColumns()) {
                    if (sc.isShowInResults()) {
                        queryColumnIndexMap.put(getQueryColumnKey(sc), indx);
                    }
                    indx++;
                }
                
                QueryDocumentRunWrapper queryWrapper 
                    = new QueryDocumentRunWrapper(qdoc, reportWrapper.getParameters());
            
                qres = mainService.runQuery(queryWrapper);
            } else {
                retval.setErrorCode(dres.getErrorCode());
                retval.setMessage(dres.getMessage());
            }
        }
        
        if (retval.isSuccess()) {
            if ((qres == null) || qres.isSuccess()) {
                QueryResult queryResult = null;
                if (qres != null) {
                    queryResult = qres.getResult();
                }

                String html = generateHtml(report, queryColumnIndexMap, queryResult);

            } else if (!qres.isSuccess()) {
                retval.setErrorCode(qres.getErrorCode());
                retval.setMessage(qres.getMessage());
            }
        }
 
        return retval;
    }
    
    private String generateHtml(ReportDocument report, Map <String, Integer> queryColumnIndexMap, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();
        
        double pageWidth = getReportWidth(report);
        double pageHeight = getReportHeight(report);
        String units = report.getPageUnits().substring(0, 2);
        int pageCount = 1;
        int gridRowSpan = 1;
        
        if (queryResult != null) {
            if (hasGridComponent(report)) {
                gridRowSpan = getDataGridRowSpan(report);
                pageCount = (int)Math.floor(queryResult.getRowCount() / gridRowSpan);
            } else {
                pageCount = queryResult.getRowCount();
            }
        }

        Map<String, Format> formatCache = new HashMap<>();
        
        retval.append("<html>\n");
        retval.append(getStyleSection(report, pageWidth, pageHeight, units));
        retval.append("<body>");

        LOG.debug("pageCount: " + pageCount);
        
        LOG.debug(retval.toString());
        List<ReportComponent> headerComponents = new ArrayList<>();
        List<ReportComponent> bodyComponents = new ArrayList<>();
        List<ReportComponent> footerComponents = new ArrayList<>();
         
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataComponent(c.getType())) {
                Map <String, Object> value = (Map <String, Object>)c.getValue();
                List<Map<String, Object>> dcols = (List<Map<String, Object>>)value.get("dataColumns");
                for (Map<String, Object> dc : dcols) {
                    Integer indx = queryColumnIndexMap.get(this.getQueryColumnKey(dc));
                    dc.put("selectIndex", indx + 1);
                }
            }
            
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
        
        // use a map to save static compononts so
        // we do not need to recreate on each page
        Map<String, String> staticComponentCache = new HashMap<>();
        for (int i = 0; i < pageCount; ++i) {
            retval.append("\n<div style=\"top: ");
            retval.append(i * pageHeight);
            retval.append(units);
            retval.append(";\" class=\"page\">");
            retval.append(getHeaderHtml(report, queryResult, headerComponents, pageHeight, units, pageCount, i, formatCache, staticComponentCache, gridRowSpan));
            retval.append(getBodyHtml(report, queryResult, bodyComponents, pageHeight, units,  pageCount, i, formatCache, staticComponentCache, gridRowSpan));
            retval.append(getFooterHtml(report, queryResult, footerComponents, pageHeight, units, pageCount, i, formatCache, staticComponentCache, gridRowSpan));
            retval.append("\n</div>");
            if (queryResult == null) {
                int currow = queryResult.getCurrentRow() + gridRowSpan;
                if (currow > queryResult.getRowCount()) {
                    break;
                } else {
                    queryResult.setCurrentRow(currow);
                }
            }
        }
        
        retval.append("\n</body>\n</html>");
        
        if (LOG.isTraceEnabled()) {
            LOG.trace(retval.toString());
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
        Map<String, Format> formatCache, 
        int gridRowSpan) {
        StringBuilder retval = new StringBuilder("");
        List<Map<String, Object>> dataColumns = null;
        if (isDataComponent(c.getType())) {
            Map<String, Object> value = (Map<String, Object>)c.getValue();
            dataColumns = (List<Map<String, Object>>)value.get("dataColumns");
        }
        
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
                retval.append(getCurrentDateHtml(c, formatCache));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID:
                retval.append(getDataFieldHtml(c, queryResult, formatCache, dataColumns));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID:
                retval.append(getDataGridHtml(c, componentIndex, queryResult, formatCache, dataColumns, gridRowSpan));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID:
                retval.append(getDataRecordHtml(c, componentIndex, queryResult, formatCache, dataColumns));
                break;
            case Constants.REPORT_COMPONENT_TYPE_CHART_ID:
                break;
            case Constants.REPORT_COMPONENT_TYPE_SUBREPORT_ID:
                break;

        }
        
        
        return retval.toString();
    }
    
    private boolean isDataComponent(String typeid) {
        return (Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID.equals(typeid)
            || Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID.equals(typeid)
            || Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID.equals(typeid));
    }
    
    private boolean isCacheableComponent(String typeid) {
        return !(isDataComponent(typeid)
            || Constants.REPORT_COMPONENT_TYPE_PAGE_NUMBER_ID.equals(typeid));
    }
    
    private String getHeaderHtml(ReportDocument report, 
        QueryResult queryResult, 
        List <ReportComponent> components,
        double pageHeight, 
        String units, 
        int pageCount, 
        int currentPage,
        Map<String, Format> formatCache,
        Map<String, String> staticComponentCache,
        int gridRowSpan) {
        StringBuilder retval = new StringBuilder();

        double top = pageHeight * currentPage;
        retval.append("\n\t<div class=\"sec-header\">");
        
        // header components
        int cindx = 0;
        for (ReportComponent c : components) {
            String cid = "header-comp-" + cindx;
            String html = null;
            
            boolean cacheable = isCacheableComponent(c.getType());
            if (cacheable) {
                html = staticComponentCache.get(cid);
            }
            
            if (StringUtils.isNotEmpty(html)) {
                retval.append(html);
            } else {
                StringBuilder buf = new StringBuilder();
                buf.append("\n\t\t<div ");
                buf.append("class=\"");
                buf.append(cid);
                buf.append("\" ");
                buf.append(getComponentStyle(report, c, top, units));
                buf.append(">\n");
                buf.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx, formatCache, gridRowSpan));
                buf.append("\t\t</div>\n");
                
                retval.append(buf);
                
                if (cacheable) {
                    staticComponentCache.put(cid, buf.toString());
                }
            }
                
            cindx++;
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
        Map<String, Format> formatCache,
        Map<String, String> staticComponentCache,
        int gridRowSpan) {
     
        double top = (pageHeight * currentPage) + report.getHeaderHeight();

        StringBuilder retval = new StringBuilder();
        retval.append("\n\t<div class=\"sec-body\">");
        
        // body components
        int cindx = 0;
        
        
        for (ReportComponent c : components) {
            String cid = "body-comp-" + cindx;
            String html = null;
            
            boolean cacheable = isCacheableComponent(c.getType());
            if (cacheable) {
                html = staticComponentCache.get(cid);
            }
            
            if (StringUtils.isNotEmpty(html)) {
                retval.append(html);
            } else {
                StringBuilder buf = new StringBuilder();
                buf.append("\n\t\t<div ");
                buf.append("class=\"body-comp-");
                buf.append(cindx);
                buf.append("\" ");
                buf.append(getComponentStyle(report, c, top, units));
                buf.append(">\n");
                buf.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx, formatCache, gridRowSpan));
                buf.append("\t\t</div>\n");
                
                retval.append(buf);
                
                if (cacheable) {
                    staticComponentCache.put(cid, buf.toString());
                }
            }
                
            cindx++;
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
        Map<String, Format> formatCache,
        Map<String, String> staticComponentCache,
        int gridRowSpan) {
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
            String cid = "footer-comp-" + cindx;
            String html = null;
            
            boolean cacheable = isCacheableComponent(c.getType());
            if (cacheable) {
                html = staticComponentCache.get(cid);
            }
            
            if (StringUtils.isNotEmpty(html)) {
                retval.append(html);
            } else {
                StringBuilder buf = new StringBuilder();
                buf.append("\n\t\t<div ");
                buf.append("class=\"footer-comp-");
                buf.append(cindx);
                buf.append("\" ");
                buf.append(getComponentStyle(report, c, top, units));
                buf.append(">\n\t\t\t");
                buf.append(getComponentValue(report, c, top, units, queryResult, currentPage, cindx, formatCache, gridRowSpan));
                buf.append("\t\t</div>\n");
                
                retval.append(buf.toString());
                
                if (cacheable) {
                    staticComponentCache.put(cid, buf.toString());
                }
            }
            
            cindx++;
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
    
    private boolean isDataGridComponent(String typeid) {
        return Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID.equals(typeid);
    }
    
    private boolean hasGridComponent(ReportDocument report) {
        boolean retval = false;
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataGridComponent(c.getType())) {
                retval = true;
                break;
            }
        }
        
        return retval;
    }
    
    private Integer getDataGridRowSpan(ReportDocument report) {
        Integer retval = 1;
        Double d = Double.MAX_VALUE;
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataGridComponent(c.getType())) {
                Map<String, Object> m = (Map<String, Object>)c.getValue();
                String layout = (String)m.get("gridLayout");
                Double drh = getDoubleMapValue("dataRowHeight", m);
                Double hrh = getDoubleMapValue("headerRowHeight", m);
                
                if (StringUtils.isNotEmpty(layout) && (drh != null) && (drh > 0) && (hrh != null)) {
                    if (((c.getHeight() - hrh) / drh) < retval) {
                        d = ((c.getHeight() - hrh) / drh);
                    }
                }
            }
        }
        
        if (d != Double.MAX_VALUE) {
            retval = d.intValue();
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
    
    private String getStyleSection(ReportDocument report, double pageWidth, double pageHeight, String units) {
        StringBuilder retval = new StringBuilder();
        retval.append("<style>\n\tbody {\n\t\tbackground-color: white;\n\t}\n\t.page {\n");
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
            if (!isDataComponent(c.getType())) {
                retval.append("\t.");
                retval.append(c.getSection());
                retval.append("-comp-");
                switch(c.getSection()) {
                    case Constants.REPORT_SECTION_HEADER:
                        retval.append(chindx);
                        break;
                    case Constants.REPORT_SECTION_BODY:
                        retval.append(cbindx);
                        break;
                    case Constants.REPORT_SECTION_FOOTER:
                        retval.append(cfindx);
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
                                retval.append(this.getShapeClass(c, chindx));
                                break;
                            case Constants.REPORT_SECTION_BODY:
                                retval.append(this.getShapeClass(c, cbindx));
                                break;
                            case Constants.REPORT_SECTION_FOOTER:
                                retval.append(this.getShapeClass(c, cfindx));
                                 break;
                        }
                        break;
                    case Constants.REPORT_COMPONENT_TYPE_IMAGE_ID:
                       switch(c.getSection()) {
                            case Constants.REPORT_SECTION_HEADER:
                                retval.append(this.getImageClass(c, c.getSection() + "-comp-" + chindx));
                                break;
                            case Constants.REPORT_SECTION_BODY:
                                retval.append(this.getImageClass(c, c.getSection() + "-comp-" + cbindx));
                                break;
                            case Constants.REPORT_SECTION_FOOTER:
                                retval.append(this.getImageClass(c, c.getSection() + "-comp-" + cfindx));
                                 break;
                        }
                       break;
                   case Constants.REPORT_COMPONENT_TYPE_EMAIL_ID:
                       switch(c.getSection()) {
                            case Constants.REPORT_SECTION_HEADER:
                                retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + chindx));
                                break;
                            case Constants.REPORT_SECTION_BODY:
                                retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + cbindx));
                                break;
                            case Constants.REPORT_SECTION_FOOTER:
                                retval.append(this.getEmailClass(c, c.getSection() + "-comp-" + cfindx));
                                 break;
                        }
                       break;
                   case Constants.REPORT_COMPONENT_TYPE_HYPERLINK_ID:
                       switch(c.getSection()) {
                            case Constants.REPORT_SECTION_HEADER:
                                retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + chindx));
                                break;
                            case Constants.REPORT_SECTION_BODY:
                                retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + cbindx));
                                break;
                            case Constants.REPORT_SECTION_FOOTER:
                                retval.append(this.getHyperlinkClass(c, c.getSection() + "-comp-" + cfindx));
                                 break;
                        }
                       break;
                }
            } else {
                retval.append(getDataComponentCss(report, c, chindx, cbindx, cfindx));
            }
            
            switch(c.getSection()) {
                case Constants.REPORT_SECTION_HEADER:
                    chindx++;
                    break;
                case Constants.REPORT_SECTION_BODY:
                    cbindx++;
                    break;
                case Constants.REPORT_SECTION_FOOTER:
                    cfindx++;
                    break;
            }

        }
        
        if (LOG.isDebugEnabled()) {
            LOG.debug(retval.toString());
        }
        
        retval.append("</style>\n");
        
        return retval.toString();
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

    private String getCurrentDateHtml(ReportComponent c, Map<String, Format> formatCache) {
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        String format = getStringMapValue("format", m);
        
        SimpleDateFormat df = (SimpleDateFormat)formatCache.get(format);
        if (df == null) {
            formatCache.put(format, df = new SimpleDateFormat(format));
        }
        
        return df.format(new Date());
    }

    private String getDataFieldHtml(ReportComponent c, QueryResult queryResult, Map<String, Format> formatCache, List<Map<String, Object>> dataColumns) {
        String retval = "";
        Map<String, Object> dc = dataColumns.get(0);
        String format = getStringMapValue("format", dc);
        int row = queryResult.getCurrentRow();
        Integer col = getIntegerMapValue("selectIndex", dc);
        List<Object> dataRow = queryResult.getData().get(row);
        
        if (col != null) {
            Object o = dataRow.get(col);
            if (o != null) {
                if (StringUtils.isNotEmpty(format)) {
                    retval = formatData(dc, formatCache, format, o);
                } else {
                    retval = o.toString();
                }
            }
        }   
        
        return retval;
    }
    
    private String formatData(Map<String, Object> dc, Map<String, Format> formatCache, String format, Object value) {
        String retval;
        Format formatter = formatCache.get(format);
        
        if (formatter == null) {
            if ((value instanceof Date) || (value instanceof Timestamp)) {
                formatCache.put(format, formatter = new SimpleDateFormat(format));
            } else if (value instanceof Number) {
                formatCache.put(format, formatter = new DecimalFormat(format));
            }
        } 
        
        if (formatter != null) {
            retval = formatter.format(value);
        } else {
            retval = value.toString();
        }
        
        return retval;
    }
 
    private String getDataGridHtml(ReportComponent c, 
        int componentIndex,
        QueryResult queryResult, 
        Map<String, Format> formatCache, 
        List<Map<String, Object>> dataColumns, 
        int gridRowSpan) {
        StringBuilder retval = new StringBuilder(""); 
        
        int currow = queryResult.getCurrentRow();
        
        for (int i = 0; i < gridRowSpan; ++i) {
            int dindx = 0;
            List<Object> dataRow = queryResult.getData().get(currow + i);
            for (Map<String, Object> dc : dataColumns) {
                String format = getStringMapValue("format", dc);
                Integer col = getIntegerMapValue("selectIndex", dc);
                retval.append("\t\t<div class=\"");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(componentIndex);
                retval.append("-h");
                retval.append(dindx);
                retval.append(">");
                retval.append(getStringMapValue("displayName", dc));
                retval.append("</div>\n");

                retval.append("\t\t<div class=\"");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(componentIndex);
                retval.append("-d");
                retval.append(dindx);
                retval.append(">");
                if (col != null) {
                    Object o = dataRow.get(col);
                    if (o != null) {
                        if (StringUtils.isNotEmpty(format)) {
                            retval.append(formatData(dc, formatCache, format, o));
                        } else {
                            retval.append(o.toString());
                        }
                    }
                }   
                retval.append("</div>\n");

                dindx++;
            }
               
            currow++;
            if ((currow >= queryResult.getRowCount()) || (i > gridRowSpan)) {
                break;
            }
        }
        
        return retval.toString();
    }

    private String getDataRecordHtml(ReportComponent c, int componentIndex, QueryResult queryResult, Map<String, Format> formatCache, List<Map<String, Object>> dataColumns) {
        StringBuilder retval = new StringBuilder("");

        int row = queryResult.getCurrentRow();
        List<Object> dataRow = queryResult.getData().get(row);

        int dindx = 0;
        for (Map<String, Object> dc : dataColumns) {
            String format = getStringMapValue("format", dc);
            Integer col = getIntegerMapValue("selectIndex", dc);
            retval.append("\t\t<div class=\"");
            retval.append(c.getSection());
            retval.append("-scomp-");
            retval.append(componentIndex);
            retval.append("-h");
            retval.append(dindx);
            retval.append(">");
            retval.append(getStringMapValue("displayName", dc));
            retval.append("</div>\n");
            
            retval.append("\t\t<div class=\"");
            retval.append(c.getSection());
            retval.append("-scomp-");
            retval.append(componentIndex);
            retval.append("-d");
            retval.append(dindx);
            retval.append(">");
            if (col != null) {
                Object o = dataRow.get(col);
                if (o != null) {
                    if (StringUtils.isNotEmpty(format)) {
                        retval.append(formatData(dc, formatCache, format, o));
                    } else {
                        retval.append(o.toString());
                    }
                }
            }   
            retval.append("</div>\n");
            dindx++;
        }
         
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
    
    private Double getDoubleMapValue(String key, Map<String, Object> m) {
        Double retval = 0.0;
        
        if (m.containsKey(key)) {
            retval = Double.parseDouble(m.get(key).toString());
        }
        
        return retval;
    
    }

    private Integer getIntegerMapValue(String key, Map<String, Object> m) {
        Integer retval = null;
        
        if (m.containsKey(key)) {
            retval = Integer.parseInt(m.get(key).toString());
        }
        
        return retval;
    }

    
    private String getQueryColumnKey(Map<String, Object> m) {
        String customSql = m.containsKey("customSql") ? m.get("customSql").toString() : "";
        String aggregateFunction = m.containsKey("aggregateFunction") ? m.get("aggregateFunction").toString() : "";
        return (customSql + aggregateFunction + (String)m.get("path"));
    };

    private String getQueryColumnKey (SqlSelectColumn sc) {
        String customSql = StringUtils.isNotEmpty(sc.getCustomSql()) ? sc.getCustomSql() : "";
        String aggregateFunction = StringUtils.isNotEmpty(sc.getAggregateFunction()) ?sc.getAggregateFunction() : "";
        return (customSql + aggregateFunction + sc.getPath());
    };

    private boolean isFreeformGridComponent(ReportComponent c) {
        boolean retval = false;
        
        if (isDataGridComponent(c.getType())) {
            Map<String, Object> m = (Map<String, Object>)c.getValue();
            String layout = getStringMapValue("gridLayout", m);
            retval = Constants.GRID_LAYOUT_FREEFORM.equals(layout);
        }
        
        return retval;
    }

            
    private String getDataComponentContainerCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        retval.append("\n\t.");
        retval.append(c.getSection());
        retval.append("-comp-");
        retval.append(cindx);
        retval.append(" {\n\t\ttop: ");
        retval.append(c.getTop());
        retval.append(units);
        retval.append(";\n\t\tleft: ");
        retval.append(c.getLeft());
        retval.append(units);
        retval.append(";\n\t\twidth: ");
        retval.append(c.getWidth());
        retval.append(units);
        retval.append(";\n\t\theight: ");
        retval.append(c.getHeight());
        retval.append(units);
        retval.append(";\n\t\ttext-align: ");
        retval.append(c.getAlign());
        retval.append(";");
        String val = getStringMapValue("gridTemplateColumns", m);
        if (StringUtils.isNotEmpty(val)) {
            retval.append("\n\t\tdisplay: grid\n\t\tgrid-template-columns: ");
            retval.append(val);
            retval.append(";\n\t\tgrid-row-gap: 0;\n");
            val = getStringMapValue("rowGap", m);
            if (StringUtils.isNotEmpty(val)) {
                Double d = Double.parseDouble(val);
                retval.append("\n\t\tpadding: ");
                retval.append(d/2);
                retval.append("px 0 ");
                retval.append(d/2);
                retval.append("px 0;\n");
            }
        }
        
        if (Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID.equals(c.getType())) {
            retval.append(c.getFontSettings().getFontCss());
            retval.append(c.getBorderSettings().getBorderCss());
        }
        
        retval.append("\t}\n");

        if (isFreeformGridComponent(c)) {
            retval.append("\n\t.");
            retval.append(c.getSection());
            retval.append("-scomp-");
            retval.append(cindx);
            retval.append("-cont {\n");
            retval.append("\t\theight: ");
            retval.append(getStringMapValue("dataRowHeight", m));
            retval.append(units);
            retval.append(";\n\t\twidth: 100%;\n");
            retval.append(c.getBorderSettings3().getBorderCss());
            retval.append("\n\t}\n");
        }   
        
        return retval.toString();
    };
    
    private String getDataRecordCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        List<Map<String, Object>> dcols = (List<Map<String, Object>>)m.get("dataColumns");
        
        int dindx = 0;
        for (Map<String, Object> dc : dcols) {
            retval.append("\t.");
            retval.append(c.getSection());
            retval.append("-scomp-");
            retval.append(cindx);
            retval.append("-h");
            retval.append(dindx);
            retval.append(" {\n\t\t");
            retval.append(";\n\t\ttext-align: ");
            retval.append(getStringMapValue("headerTextAlign", dc));
            retval.append(";\n");
            retval.append(c.getFontSettings().getFontCss());
            retval.append(c.getBorderSettings().getBorderCss());
            retval.append("\t}\n");

            retval.append("\t.");
            retval.append(c.getSection());
            retval.append("-scomp-");
            retval.append(cindx);
            retval.append("-d");
            retval.append(dindx);
            retval.append(" {\n\t\tpadding-left: 5px;\n\t\ttext-align: ");
            retval.append(getStringMapValue("dataTextAlign", dc));
            retval.append(";\n");
            retval.append(c.getFontSettings2().getFontCss());
            retval.append(c.getBorderSettings2().getBorderCss());
            retval.append("\t}\n");
       }
        
        return retval.toString();
    }
    
    private String getDataGridCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>)c.getValue();
        List<Map<String, Object>> dcols = (List<Map<String, Object>>)m.get("dataColumns");
        
        int dindx = 0;
        for (Map<String, Object> dc : dcols) {
            if (Constants.GRID_FORMAT_TABLULAR.equals(getStringMapValue("gridFormat", m))) {
                retval.append("\t.");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(cindx);
                retval.append("-h");
                retval.append(dindx);
                retval.append(" {\n\t\t");
                retval.append("height: ");
                retval.append(this.getStringMapValue("headerRowHeight", m));
                retval.append(units);
                retval.append(";\n\t\ttext-align: ");
                retval.append(getStringMapValue("textAlign", m));
                retval.append(c.getFontSettings().getFontCss());
                retval.append(c.getBorderSettings().getBorderCss());
                retval.append("\t}\n");

                retval.append("\t.");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(cindx);
                retval.append("-d");
                retval.append(dindx);
                retval.append(" {\n\t\t");
                retval.append("height: ");
                retval.append(this.getStringMapValue("dataRowHeight", m));
                retval.append(units);
                retval.append(";\n\t\ttext-align: ");
                retval.append(this.getStringMapValue("dataTextAlign", dc));
                retval.append(";\n");
                retval.append(c.getFontSettings2().getFontCss());
                retval.append(c.getBorderSettings2().getBorderCss());
                retval.append("\t}\n");
            } else {
                retval.append("\t.");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(cindx);
                retval.append("-h");
                retval.append(dindx);
                retval.append(" {\n\t\t");
                retval.append("left: ");
                retval.append(this.getStringMapValue("labelLeft", dc));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(this.getStringMapValue("labelHeight", dc));
                retval.append(units);
                retval.append(";\n\t\ttop: ");
                retval.append(this.getStringMapValue("labelTop", dc));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(this.getStringMapValue("labelWidth", dc));
                retval.append(units);
                retval.append(";\n\t\ttext-align: ");
                retval.append(this.getStringMapValue("labelTextAlign", dc));
                retval.append(";\n");
                retval.append(c.getFontSettings().getFontCss());
                retval.append(c.getBorderSettings().getBorderCss());
                retval.append("\t}\n");

                
                retval.append("\t.");
                retval.append(c.getSection());
                retval.append("-scomp-");
                retval.append(cindx);
                retval.append("-d");
                retval.append(dindx);
                retval.append(" {\n\t\t");
                retval.append("left: ");
                retval.append(this.getStringMapValue("dataLeft", dc));
                retval.append(units);
                retval.append(";\n\t\theight: ");
                retval.append(this.getStringMapValue("dataHeight", dc));
                retval.append(units);
                retval.append(";\n\t\ttop: ");
                retval.append(this.getStringMapValue("dataTop", dc));
                retval.append(units);
                retval.append(";\n\t\twidth: ");
                retval.append(this.getStringMapValue("dataWidth", dc));
                retval.append(units);
                retval.append(";\n\t\ttext-align: ");
                retval.append(this.getStringMapValue("dataTextAlign", dc));
                retval.append(";\n");
                retval.append(c.getFontSettings2().getFontCss());
                retval.append(c.getBorderSettings2().getBorderCss());
                retval.append("\t}\n");
            }
            
            dindx++;
        }
        
        return retval.toString();
    }
    
    private String getDataComponentCss(ReportDocument report, ReportComponent c, int chindx, int cbindx, int cfindx) {
        StringBuilder retval = new StringBuilder();
        String units = report.getPageUnits().substring(0, 2);
        
        switch (c.getType()) {
            case Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID:
                retval.append(getDataComponentContainerCss(c, chindx, units));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID:
                retval.append(getDataComponentContainerCss(c, cbindx, units));
                retval.append(getDataRecordCss(c, cbindx, units));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID:
                retval.append(getDataComponentContainerCss(c, cfindx, units));
                retval.append(getDataGridCss(c, cbindx, units));
                break;
        }
        return retval.toString();
    }
}
