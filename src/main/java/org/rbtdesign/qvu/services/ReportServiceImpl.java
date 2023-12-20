package org.rbtdesign.qvu.services;

import com.lowagie.text.pdf.BaseFont;
import java.io.ByteArrayOutputStream;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.BorderSettings;
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
import org.rbtdesign.qvu.util.Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

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
        OperationResult<ReportDocument> res = mainService.getReportDocument(reportWrapper.getGroupName(), reportWrapper.getDocumentName(), reportWrapper.getUser());

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
        Map<String, Integer> queryColumnIndexMap = new HashMap<>();
        ByteArrayOutputStream bos = null;
        try {
            ReportDocument report = reportWrapper.getDocument();
            if (StringUtils.isNotEmpty(report.getQueryDocumentName())) {
                OperationResult<QueryDocument> dres = fileHandler.getQueryDocument(report.getQueryDocumentGroup(), report.getRunUser(), report.getQueryDocumentName());

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

                    if (LOG.isDebugEnabled()) {
                        LOG.debug(html);
                    }

                    Document document = Jsoup.parse(html);
                    document.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
                    ITextRenderer iTextRenderer = new ITextRenderer();
                    addFont(iTextRenderer);
                    iTextRenderer.setDocumentFromString(document.html());
                    iTextRenderer.layout();
                    bos = new ByteArrayOutputStream();
                    iTextRenderer.createPDF(bos);
                    retval.setResult(bos.toByteArray());

                } else if (!qres.isSuccess()) {
                    retval.setErrorCode(qres.getErrorCode());
                    retval.setMessage(qres.getMessage());
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            retval.setErrorCode(OperationResult.UNEXPECTED_EXCEPTION);
            retval.setMessage(ex.toString());
        } finally {
            if (bos != null) {
                try {
                    bos.close();
                } catch (Exception ex) {
                };
            }
        }

        return retval;
    }

    private String generateHtml(ReportDocument report, Map<String, Integer> queryColumnIndexMap, QueryResult queryResult) {
        StringBuilder retval = new StringBuilder();

        double pageWidth = getReportWidth(report);
        double pageHeight = getReportHeight(report);
        String units = report.getPageUnits().substring(0, 2);
        int pageCount = 1;
        int gridRowSpan = 1;

        if (queryResult != null) {
            if (hasGridComponent(report)) {
                gridRowSpan = getDataGridRowSpan(report);
                double cnt = (double)queryResult.getRowCount() / (double)gridRowSpan;
                pageCount = (int) Math.ceil(cnt);
            } else {
                pageCount = queryResult.getRowCount();
            }
        }

        Map<String, Format> formatCache = new HashMap<>();

        retval.append("<html>\n");
        retval.append(getStyleSection(report, pageWidth, pageHeight, units, gridRowSpan));
        retval.append("<body>");

        LOG.debug("pageCount: " + pageCount);

        Map<Integer, Double[]> totalsMap = new HashMap<>();
        for (ReportComponent c : report.getReportComponents()) {
            if (isDataComponent(c.getType())) {
                Map<String, Object> value = (Map<String, Object>) c.getValue();
                List<Map<String, Object>> dcols = (List<Map<String, Object>>) value.get("dataColumns");
                for (Map<String, Object> dc : dcols) {
                    Integer indx = queryColumnIndexMap.get(this.getQueryColumnKey(dc));
                    dc.put("selectIndex", indx + 1);
                }
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
            for (String section : Constants.REPORT_SECTIONS) {
                retval.append(getSectionHtml(report, section, queryResult, pageCount, i, formatCache, staticComponentCache, gridRowSpan, units, totalsMap));
            }
            retval.append("\n</div>");
            if (queryResult != null) {
                int currow = queryResult.getCurrentRow() + gridRowSpan;
                if (currow > queryResult.getRowCount()) {
                    break;
                } else {
                    queryResult.setCurrentRow(currow);
                }
            }
        }

        
        retval.append("\n</body>\n</html>");

        return retval.toString();
    }

    private String getComponentValue(
            ReportComponent c,
            QueryResult queryResult,
            int currentPage,
            int componentIndex,
            Map<String, Format> formatCache,
            int gridRowSpan,
            String units,
            Map<Integer, Double[]> totalsMap) {
        StringBuilder retval = new StringBuilder("");
        List<Map<String, Object>> dataColumns = null;
        if (isDataComponent(c.getType())) {
            Map<String, Object> value = (Map<String, Object>) c.getValue();
            dataColumns = (List<Map<String, Object>>) value.get("dataColumns");
        }

        switch (c.getType()) {
            case Constants.REPORT_COMPONENT_TYPE_TEXT_ID:
                retval.append(c.getValue());
                break;
            case Constants.REPORT_COMPONENT_TYPE_IMAGE_ID:
                retval.append(getImageHtml(c));
                break;
            case Constants.REPORT_COMPONENT_TYPE_SHAPE_ID:
                retval.append("<div></div>");
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
                retval.append(getDataFieldHtml(queryResult, formatCache, dataColumns));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID:
                retval.append(getDataGridHtml(c, componentIndex, queryResult, formatCache, dataColumns, gridRowSpan, units, totalsMap));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID:
                retval.append(getDataRecordHtml(componentIndex, queryResult, formatCache, dataColumns));
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

    private List<Map<String, Object>> getDataColumns(ReportComponent c) {
        List<Map<String, Object>> retval = null;
        Object val = c.getValue();
        
        if ((val != null) && (val instanceof Map)) {
            Map<String, Object> m = (Map<String, Object>)val;
            if (m.containsKey("dataColumns")) {
                retval = (List<Map<String, Object>>)m.get("dataColumns");
            }
        }
        
        return retval;
    }
       
        
    private String getSectionHtml(ReportDocument report,
            String section,
            QueryResult queryResult,
            int pageCount,
            int currentPage,
            Map<String, Format> formatCache,
            Map<String, String> staticComponentCache,
            int gridRowSpan,
            String units,
            Map<Integer, Double[]> totalsMap) {
        StringBuilder retval = new StringBuilder();

        retval.append("\n\t<div class=\"sec-");
        retval.append(section);
        retval.append("\" ");

        if (Constants.REPORT_SECTION_FOOTER.equals(section)) {
            if (pageCount > (currentPage + 1)) {
                retval.append("style=\"break-after: always;\"");
            }
        }

        retval.append(">\n");

        // footer components
        int cindx = 0;
        for (ReportComponent c : report.getReportComponents()) {
            if (section.equals(c.getSection())) {
                String clazz = "comp-" + cindx;
                String html = null;

                boolean cacheable = isCacheableComponent(c.getType());
                if (cacheable) {
                    html = staticComponentCache.get(clazz);
                }

                if (StringUtils.isNotEmpty(html)) {
                    retval.append(html);
                } else {
                    StringBuilder buf = new StringBuilder();
                    if (isTabularGridComponent(c) || isDataRecordComponent(c)) {
                        buf.append("\n\t\t<table cellpadding=\"0\" cellspacing=\"0\" ");
                    } else {
                        buf.append("\n\t\t<div ");
                    }
                    buf.append("class=\"");
                    buf.append(clazz);
                    buf.append("\">\n\t\t\t");
                    buf.append(getComponentValue(c, queryResult, currentPage, cindx, formatCache, gridRowSpan, units, totalsMap));
                    if (isTabularGridComponent(c) || isDataRecordComponent(c)) {
                        // if this is last page and we have totals configured
                        if (totalsMap.containsKey(cindx) 
                            && (currentPage == (pageCount - 1))) {
                            buf.append("\n\t\t\t<tr class=\"trd\"><td style=\"border: none;height: 3px;\" colspan=\"");
                            List<Map<String, Object>> dataColumns = getDataColumns(c);
                            buf.append(dataColumns.size());
                            buf.append("\"><hr style=\"border: solid 1px black;\"/></td></tr>\n\t\t<tr class=\"trd\">");

                            Double[] totals = totalsMap.get(cindx);
                            for (int i = 0; i < totals.length; ++i) {
                                Double d = totals[i];
                                Map<String, Object> dc = dataColumns.get(i);
                                buf.append("<td style=\"border: none;\" style=\"border: none;\"><div class=\"");
                  
                                String align = getStringMapValue("dataTextAlign", dc);
                                
                                switch(align) {
                                    case "left":
                                        buf.append("tal");
                                        break;
                                    case "center":
                                        buf.append("tac");
                                        break;
                                    case "right":
                                        buf.append("tar");
                                        break;
                                }
                                
                                buf.append("\">");
                                if (d != null) {
                                    String format = getStringMapValue("displayFormat", dc);
                                    if (StringUtils.isNotEmpty(format)) {
                                        DecimalFormat formatter = (DecimalFormat)formatCache.get(format);
                                        buf.append(formatter.format(totals[i]));
                                    } else {
                                        buf.append(totals[i]);
                                    }
                                }
                                buf.append("</div></td>");
                            }
                        }
                        buf.append("\n\t\t</table>\n");
                    } else {
                        buf.append("\n\t\t</div>\n");
                    }

                    retval.append(buf.toString());

                    if (cacheable) {
                        staticComponentCache.put(clazz, buf.toString());
                    }
                }
            }

            cindx++;
        }

        retval.append("\t</div>\n");

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
                Map<String, Object> m = (Map<String, Object>) c.getValue();
                String layout = (String) m.get("gridLayout");
                Double drh = getDoubleMapValue("dataRowHeight", m) - Helper.getBorderAdjustmentForPdf(report.getPageUnits().substring(0, 2), c.getBorderSettings());
                Double hrh = getDoubleMapValue("headerRowHeight", m) - Helper.getBorderAdjustmentForPdf(report.getPageUnits().substring(0, 2), c.getBorderSettings2());

                 if (StringUtils.isNotEmpty(layout)) {
                    double dataHeight = c.getHeight() - hrh;
                    if ((dataHeight / drh) < d) {
                        d = (dataHeight / drh);
                    }
                }
            }
        }


        if (d != Double.MAX_VALUE) {
            retval = d.intValue();
        }

        if (LOG.isDebugEnabled()) {
            LOG.debug("grid row span: " + retval);
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
    
    private String getStyleSection(ReportDocument report, double pageWidth, double pageHeight, String units, int gridRowSpan) {
        StringBuilder retval = new StringBuilder();
        retval.append("<style>\n");
        retval.append("\n\t@page {\n");
        retval.append("\t\tmargin-left: 0;\n");
        retval.append("\t\tmargin-top: 0;\n");
        retval.append("\t\tmargin-right: 0;\n");
        retval.append("\t\tmargin-bottom: 0;\n");
        retval.append("\t\tsize: ");
        retval.append(report.getPageSize());
        retval.append(" ");
        retval.append(report.getPageOrientation());
        retval.append(";\n\t}\n");

        retval.append("\n\tbody {\n\t\tbackground-color: transparent;\n\t\theight: 100%;\n\t\twidth: 100%;\n}\n");
        retval.append("\n\t.page {");
        retval.append("\t\tposition: absolute;\n\t\twidth: ");
        retval.append(pageWidth);
        retval.append(units);
        retval.append(";\n\t\theight: ");
        retval.append(pageHeight);
        retval.append(units);
        retval.append(";\n\t}\n");

        for (String section : Constants.REPORT_SECTIONS) {
            retval.append(getSectionClass(report, section, units, pageHeight, pageWidth));
        }

        for (int i = 0; i < report.getReportComponents().size(); ++i) {
            ReportComponent c = report.getReportComponents().get(i);
            if (!isDataComponent(c.getType())) {
                retval.append("\t.");
                retval.append("comp-");
                retval.append(i);
                retval.append(" {\n\t\tleft: ");
                retval.append(c.getLeft());
                retval.append(units);
                retval.append(";\n\t\ttop: ");
                retval.append(c.getTop());
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

                switch (c.getType()) {
                    case Constants.REPORT_COMPONENT_TYPE_SHAPE_ID:
                        retval.append(this.getShapeClass(c, i));
                        break;
                    case Constants.REPORT_COMPONENT_TYPE_IMAGE_ID:
                        retval.append(this.getImageClass(c, i));
                        break;
                    case Constants.REPORT_COMPONENT_TYPE_EMAIL_ID:
                        retval.append(this.getEmailClass(c, i));
                        break;
                    case Constants.REPORT_COMPONENT_TYPE_HYPERLINK_ID:
                        retval.append(this.getHyperlinkClass(c, i));
                        break;
                }
            } else {
                retval.append(getDataComponentCss(report, c, i, gridRowSpan));
            }
        }

        retval.append("</style>\n");

        return retval.toString();
    }

    private String getSectionClass(ReportDocument report, String section, String units, double pageHeight, double pageWidth) {
        StringBuilder retval = new StringBuilder();
        retval.append("\n\t.sec-");
        retval.append(section);
        retval.append(" {\n\t\tposition: absolute;\n");
        switch (section) {
            case Constants.REPORT_SECTION_HEADER:
                retval.append("\t\tmargin: ");
                retval.append(report.getPageBorder().get(1));
                retval.append(units);
                retval.append(" ");
                retval.append(+report.getPageBorder().get(2));
                retval.append(units);
                retval.append(" 0 ");
                retval.append(report.getPageBorder().get(0));
                retval.append(units);
                retval.append(";\n\t\twidth: ");
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
                retval.append(";;\n\t\ttop: ");
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
    }

    private double getReportWidth(ReportDocument report) {
        double retval;
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
        double retval;
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

    private String getImageClass(ReportComponent c, int indx) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();

        Boolean sizeToFit = getBooleanMapValue("sizetofit", m);
        String linkurl = getStringMapValue("linkurl", m);

        if (sizeToFit) {
            retval.append("\t.comp-");
            retval.append(indx);
            retval.append(" img {\n\t\twidth: 100%;\n\t\theight: 100%;");
        }

        if (StringUtils.isNotEmpty(linkurl)) {
            if (retval.isEmpty()) {
                retval.append("\t.comp-");
                retval.append(indx);
                retval.append(" a {\t\tcursor: pointer;\n");
            } else {
                retval.append("\t\tcursor: pointer;\n");
            }
        }

        if (!retval.isEmpty()) {
            retval.append("\t}\n");
        }

        return retval.toString();
    }

    private String getImageHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();

        String linkurl = getStringMapValue("linkurl", m);
        String url = getStringMapValue("url", m);
        String alttext = getStringMapValue("alttext", m);

        if (StringUtils.isNotEmpty(linkurl)) {
            retval.append("<a href=\"");
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
            retval.append("<img ");

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

    private String getShapeClass(ReportComponent c, int indx) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        String shape = getStringMapValue("shape", m);
        Boolean wantborder = getBooleanMapValue("wantborder", m);
        Boolean wantfilled = getBooleanMapValue("wantfilled", m);
        String borderColor = getStringMapValue("bordercolor", m);
        String border = getStringMapValue("border", m);
        String fillColor = getStringMapValue("fillcolor", m);
        String width = getStringMapValue("width", m);
        String opacity = getStringMapValue("opacity", m);

        retval.append("\t.");
        retval.append("comp-");
        retval.append(indx);
        retval.append(" div {\n");
        if (Constants.SHAPE_HORIZONTAL_LINE.equals(shape)
                || (Constants.SHAPE_VERTICAL_LINE.equals(shape))) {
            retval.append("\t\tbackground-color: ");
            retval.append(fillColor);
            retval.append(";\n\t\tposition absolute;\n");
            if (Constants.SHAPE_HORIZONTAL_LINE.equals(shape)) {
                retval.append("\t\twidth: 100%;\n\t\theight: ");
                retval.append(width);
                retval.append("px;\n\t\ttop: 50%;\n");
            } else {
                retval.append("\t\twidth: ");
                retval.append(width);
                retval.append("px;\n\t\theight: 100%;\n\t\tmargin-left: 50%;\n");
            }
            retval.append("\t}\n");
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

    private String getEmailClass(ReportComponent c, int indx) {
        StringBuilder retval = new StringBuilder("");
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        Boolean underline = getBooleanMapValue("underline", m);
        if ((underline == null) || !underline) {
            retval.append("\t.comp-");
            retval.append(indx);
            retval.append(" a {\n");
            retval.append("\t\ttext-decoration: none;\n\t}\n");
        }

        return retval.toString();
    }

    private String getEmailHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        String subject = getStringMapValue("subject", m);
        String to = getStringMapValue("to", m);
        String text = getStringMapValue("text", m);

        retval.append("<a ");
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

    private String getHyperlinkClass(ReportComponent c, int indx) {
        StringBuilder retval = new StringBuilder("");
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        Boolean underline = getBooleanMapValue("underline", m);
        if ((underline == null) || !underline) {
            retval.append("\t.comp-");
            retval.append(indx);
            retval.append(" a {\n");
            retval.append("\t\ttext-decoration: none;\n\t}\n");
        }

        return retval.toString();
    }

    private String getHyperlinkHtml(ReportComponent c) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        String text = getStringMapValue("text", m);
        String url = getStringMapValue("url", m);
        retval.append("<a ");

        retval.append("href=\"");
        retval.append(url);
        retval.append(" target=\"_blank\">");
        retval.append(text);
        retval.append("</a>\n");

        return retval.toString();
    }

    private String getPageNumberHtml(ReportComponent c, int currentPage) {
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        String format = getStringMapValue("displayFormat", m);
        return format.replace("?", "" + (currentPage + 1));
    }

    private String getCurrentDateHtml(ReportComponent c, Map<String, Format> formatCache) {
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        String format = getStringMapValue("displayFormat", m);

        if (StringUtils.isEmpty(format)) {
            format = Constants.DEFAULT_DATE_FORMAT;
        }

        SimpleDateFormat df = (SimpleDateFormat) formatCache.get(format);
        if (df == null) {
            formatCache.put(format, df = new SimpleDateFormat(format));
        }

        return df.format(new Date());
    }

    private String getDataFieldHtml(QueryResult queryResult, Map<String, Format> formatCache, List<Map<String, Object>> dataColumns) {
        String retval = "";
        Map<String, Object> dc = dataColumns.get(0);
        String format = getStringMapValue("displayFormat", dc);
        int row = queryResult.getCurrentRow();
        if (row < queryResult.getData().size()) {
            Integer col = getIntegerMapValue("selectIndex", dc);
            List<Object> dataRow = queryResult.getData().get(row);

            if (col != null) {
                Object o = dataRow.get(col);
                if (o != null) {
                    if (StringUtils.isNotEmpty(format)) {
                        retval = formatData(formatCache, format, o);
                    } else {
                        retval = o.toString();
                    }
                }
            }
        }
        
        return retval;
    }

    private String formatData(Map<String, Format> formatCache, String format, Object value) {
        String retval = "";
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
        } else if (value != null) {
            retval = value.toString();
        }

        return retval;
    }

    private String getDataGridHtml(ReportComponent c,
            int componentIndex,
            QueryResult queryResult,
            Map<String, Format> formatCache,
            List<Map<String, Object>> dataColumns,
            int gridRowSpan,
            String units, Map<Integer, Double[]> totalsMap) {

        if (isTabularGridComponent(c)) {
            return getTabularGridHtml(queryResult, componentIndex, formatCache, dataColumns, gridRowSpan, totalsMap);
        } else {
            return getFreeformGridHtml(c, componentIndex, queryResult, formatCache, dataColumns, gridRowSpan, units);
        }
    }

    private String getTabularGridHtml(QueryResult queryResult,
            int componentIndex,
            Map<String, Format> formatCache,
            List<Map<String, Object>> dataColumns,
            int gridRowSpan,
            Map<Integer, Double[]> totalsMap) {
        StringBuilder retval = new StringBuilder("");

        int currow = queryResult.getCurrentRow();

        if (currow < queryResult.getData().size()) {
            int dindx = 0;
            retval.append("<tr class=\"trh\">\n");
            for (Map<String, Object> dc : dataColumns) {
               String align = getStringMapValue("headerTextAlign", dc);

                switch(align) {
                    case "left":
                        retval.append("\t\t\t\t<td><div class=\"tal\"");
                        break;
                    case "center":
                        retval.append("\t\t\t\t<td><div class=\"tac\"");
                        break;
                    case "right":
                        retval.append("\t\t\t\t<td><div class=\"tar\"");
                        break;
                }

                retval.append(">");

                retval.append(getStringMapValue("displayName", dc));
                retval.append("</div></td>\n");
                dindx++;
            }
            retval.append("\t\t\t</tr>\n");

            for (int i = 0; (i < gridRowSpan) && (currow < queryResult.getRowCount()); ++i) {
                retval.append("\t\t\t<tr class=\"trd\">\n");
                List<Object> dataRow = queryResult.getData().get(currow);
                dindx = 0;
                for (Map<String, Object> dc : dataColumns) {
                    String format = getStringMapValue("displayFormat", dc);
                    Integer col = getIntegerMapValue("selectIndex", dc);
                    String align = getStringMapValue("dataTextAlign", dc);

                    switch(align) {
                        case "left":
                            retval.append("\t\t\t\t<td><div class=\"tal\"");
                            break;
                        case "center":
                            retval.append("\t\t\t\t<td><div class=\"tac\"");
                            break;
                        case "right":
                            retval.append("\t\t\t\t<td><div class=\"tar\"");
                            break;
                    }
                    retval.append(">");
                    if (col != null) {
                        Object o = dataRow.get(col);
                        if (o != null) {
                            boolean wantTotals = getBooleanMapValue("addTotal", dc);
                            if (wantTotals) {
                                Double[] totals = totalsMap.get(componentIndex);
                                if (totals == null) {
                                    totals = new Double[dataColumns.size()];
                                    for (int j = 0; j < totals.length; ++j) {
                                        totals[j] = null;
                                    }
                                    
                                    totalsMap.put(componentIndex, totals);
                                } 
                                
                                if (totals[dindx] == null) {
                                    totals[dindx] = 0.0;
                                }   
                                 
                                totals[dindx] += Double.parseDouble(o.toString());
                            }
                            
                            if (StringUtils.isNotEmpty(format)) {
                                retval.append(formatData(formatCache, format, o));
                            } else {
                                retval.append(o.toString().trim());
                            }
                        }
                    }

                    retval.append("</div></td>\n");

                    dindx++;
                }
                retval.append("\t\t\t</tr>\n");
                currow++;
            }
        }

        return retval.toString();
    }

    private String getFreeformGridHtml(ReportComponent c,
            int componentIndex,
            QueryResult queryResult,
            Map<String, Format> formatCache,
            List<Map<String, Object>> dataColumns,
            int gridRowSpan,
            String units) {
        StringBuilder retval = new StringBuilder("");

        int currow = queryResult.getCurrentRow();

        if (currow < queryResult.getData().size()) {
            int dindx = 0;

            Map<String, Object> m = (Map<String, Object>) c.getValue();
            String altrowcolor = getStringMapValue("altrowcolor", m);
            Double dataRowHeight = getDoubleMapValue("dataRowHeight", m);
            for (int i = 0; (i < gridRowSpan) && (currow < queryResult.getRowCount()); ++i) {
                List<Object> dataRow = queryResult.getData().get(currow);
                double top = i * dataRowHeight;
                retval.append("\t\t<div class=\"scomp-");
                retval.append(componentIndex);
                retval.append("-cont\" style=\"top: ");
                retval.append(top);
                retval.append(units);
                retval.append(";\">\n");

                dindx = 0;
                for (Map<String, Object> dc : dataColumns) {
                    retval.append("\t\t\t<div class=\"");
                    retval.append("scomp-");
                    retval.append(componentIndex);
                    retval.append("-h");
                    retval.append(dindx);
                    retval.append("\">");
                    retval.append(getStringMapValue("displayName", dc));
                    retval.append("</div>\n");

                    String format = getStringMapValue("displayFormat", dc);
                    Integer col = getIntegerMapValue("selectIndex", dc);
                    retval.append("\t\t\t<div class=\"");
                    retval.append("scomp-");
                    retval.append(componentIndex);
                    retval.append("-d");
                    retval.append(dindx);
                    retval.append("\"");

                    if (StringUtils.isNotEmpty(altrowcolor) && (((i + 1) % 2) == 0)) {
                        retval.append(" style=\"background-color: ");
                        retval.append(altrowcolor);
                        retval.append(";\"");
                    }

                    retval.append(">");
                    if (col != null) {
                        Object o = dataRow.get(col);
                        if (o != null) {
                            if (StringUtils.isNotEmpty(format)) {
                                retval.append(formatData(formatCache, format, o));
                            } else {
                                retval.append(o.toString());
                            }
                        }
                    }

                    retval.append("</div>\n");

                    dindx++;
                }
                retval.append("\t\t</div>\n");

                currow++;
            }
        }
        
        return retval.toString();
    }

    private String getDataRecordHtml(int componentIndex, QueryResult queryResult, Map<String, Format> formatCache, List<Map<String, Object>> dataColumns) {
        StringBuilder retval = new StringBuilder("");

        int row = queryResult.getCurrentRow();
        
        if (row < queryResult.getData().size()) {
            List<Object> dataRow = queryResult.getData().get(row);

            int dindx = 0;
            for (Map<String, Object> dc : dataColumns) {
                String format = getStringMapValue("displayFormat", dc);
                Integer col = getIntegerMapValue("selectIndex", dc);
                retval.append("<tr><td class=\"");
                retval.append("scomp-");
                retval.append(componentIndex);
                retval.append("-h");
                retval.append(dindx);
                retval.append("\">");
                retval.append(getStringMapValue("displayName", dc));
                retval.append("</td>\n");

                retval.append("\t\t\t<td class=\"");
                retval.append("scomp-");
                retval.append(componentIndex);
                retval.append("-d");
                retval.append(dindx);
                retval.append("\">");
                if (col != null) {
                    Object o = dataRow.get(col);
                    if (o != null) {
                        if (StringUtils.isNotEmpty(format)) {
                            retval.append(formatData(formatCache, format, o));
                        } else {
                            retval.append(o.toString());
                        }
                    }
                }
                retval.append("</td><tr>\n");
                dindx++;
            }
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
            retval = Double.valueOf(m.get(key).toString());
        }

        return retval;

    }

    private Integer getIntegerMapValue(String key, Map<String, Object> m) {
        Integer retval = null;

        if (m.containsKey(key)) {
            retval = Integer.valueOf(m.get(key).toString());
        }

        return retval;
    }

    private String getQueryColumnKey(Map<String, Object> m) {
        String customSql = m.containsKey("customSql") ? m.get("customSql").toString() : "";
        String aggregateFunction = m.containsKey("aggregateFunction") ? m.get("aggregateFunction").toString() : "";
        return (customSql + aggregateFunction + (String) m.get("path"));
    }

    ;

    private String getQueryColumnKey(SqlSelectColumn sc) {
        String customSql = StringUtils.isNotEmpty(sc.getCustomSql()) ? sc.getCustomSql() : "";
        String aggregateFunction = StringUtils.isNotEmpty(sc.getAggregateFunction()) ? sc.getAggregateFunction() : "";
        return (customSql + aggregateFunction + sc.getPath());
    }

    ;

    private boolean isFreeformGridComponent(ReportComponent c) {
        boolean retval = false;

        if (isDataGridComponent(c.getType())) {
            Map<String, Object> m = (Map<String, Object>) c.getValue();
            String layout = getStringMapValue("gridLayout", m);
            retval = Constants.GRID_LAYOUT_FREEFORM.equals(layout);
        }

        return retval;
    }

    private boolean isTabularGridComponent(ReportComponent c) {
        boolean retval = false;

        if (isDataGridComponent(c.getType())) {
            Map<String, Object> m = (Map<String, Object>) c.getValue();
            String layout = getStringMapValue("gridLayout", m);
            retval = Constants.GRID_LAYOUT_TABULAR.equals(layout);
        }

        return retval;
    }

    private boolean isDataRecordComponent(ReportComponent c) {
        return Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID.equals(c.getType());
    }

    private String getDataFieldCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        retval.append("\n\t.");
        retval.append("comp-");
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
        retval.append(";\n\t\tposition: absolute;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t\toverflow: hidden;\n");
        retval.append(c.getFontSettings().getFontCss());
        retval.append(c.getBorderSettings().getBorderCss());
        retval.append("\t}\n");
        return retval.toString();
    }

    private String getDataGridCss(ReportComponent c, int cindx, String units, int gridRowSpan) {
        if (isFreeformGridComponent(c)) {
            return getFreeformGridCss(c, cindx, units, gridRowSpan);
        } else {
            return getTabularGridCss(c, cindx, units);
        }
    }

    private String getTabularGridCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        
        double headerRowHeight = getDoubleMapValue("headerRowHeight", m);
        double dataRowHeight = getDoubleMapValue("dataRowHeight", m);
        
        retval.append("\n\t.");
        retval.append("comp-");
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
        retval.append(";\n\t\tmax-height: ");
        retval.append(c.getHeight());
        retval.append(units);
        retval.append(";\n\t\ttext-align: ");
        retval.append(c.getAlign());
        retval.append(";\n\t\tposition: absolute;\n\t\tborder-collapse: collapse;\n\t\toverflow: hidden;\n");
        retval.append("\t}\n");

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trh {\n");
        retval.append(c.getFontSettings().getFontCss());
        retval.append("\t\toverflow: hidden;\n");
        retval.append("\t}\n");

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trd {\n");
        retval.append(c.getFontSettings2().getFontCss());
        retval.append("\t\toverflow: hidden;\n");
        retval.append("\t}\n");

        String arc = getStringMapValue("altrowcolor", m);

        if (StringUtils.isNotEmpty(arc)) {
            retval.append("\n\t.comp-");
            retval.append(cindx);
            retval.append(" .trd:nth-child(even) {\n\t\tbackground-color: ");
            retval.append(arc);
            retval.append(";\n\t}\n");
        }

        String val = getStringMapValue("gridTemplateColumns", m);
        StringTokenizer st = new StringTokenizer(val);

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trh td {\n");
        retval.append(c.getBorderSettings().getBorderCss());
        retval.append("\t}\n");

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trh td div {\n\t\tvertival-align: top;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t\theight: ");
        retval.append(headerRowHeight - Helper.getBorderAdjustmentForPdf(units, c.getBorderSettings()));
        retval.append(units);
        retval.append(";\n\t\toverflow: hidden;\n\t}\n");

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trd td {\n");
        retval.append(c.getBorderSettings2().getBorderCss());
        retval.append("\t}\n");

        retval.append("\n\t.comp-");
        retval.append(cindx);
        retval.append(" .trd td div {\n\t\tvertical-align: top;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t\theight: ");
        retval.append(dataRowHeight - Helper.getBorderAdjustmentForPdf(units, c.getBorderSettings2()));
        retval.append(units);
        retval.append(";\n\t\toverflow: hidden;\n\t}\n");

        int dindx = 0;
        while (st.hasMoreTokens()) {
            String width = st.nextToken();
            retval.append("\n\t.comp-");
            retval.append(cindx);
            retval.append(" .trh td:nth-child(");
            retval.append(dindx + 1);
            retval.append(") {\t\twidth: ");
            retval.append(width);
            retval.append(";\n\t}\n");
            dindx++;
        }
        
        retval.append("\n\t.tac {\n\t\ttext-align: center;\n\t}");
        retval.append("\n\t.tal {\n\t\ttext-align: left;\n\t}");
        retval.append("\n\t.tar {\n\t\ttext-align: right;\n\t}");

        return retval.toString();
    }

    ;
    
    private String getFreeformGridCss(ReportComponent c, int cindx, String units, int gridRowSpan) {
        StringBuilder retval = new StringBuilder();

        Map<String, Object> m = (Map<String, Object>) c.getValue();
        
        double calcHeight = Math.min(c.getHeight(), (getDoubleMapValue("dataRowHeight", m) * gridRowSpan));
        retval.append("\n\t.");
        retval.append("comp-");
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
        retval.append(calcHeight);
        retval.append(units);
        retval.append(";\n\t\ttext-align: ");
        retval.append(c.getAlign());
        retval.append(";\n\t\tposition: absolute;\n\t\tmargin: 0;\n\t\tpadding: 0;\n");
        retval.append("\t}\n");

        retval.append("\n\t.");
        retval.append("scomp-");
        retval.append(cindx);
        retval.append("-cont {\n");
        retval.append("\n\t\tposition: absolute;\n\t\tleft: 0;width: 100%;\n\t\theight: ");

        BorderSettings bs = c.getBorderSettings3();
        int bw = bs.getWidth();
        Double height = getDoubleMapValue("dataRowHeight", m);
        if (!Constants.NONE.equals(bs.getBorder())) {
            if (bs.isBottom()) {
                height -= ((double) bw / Constants.PIXELS_PER_INCH);
            }

            if ((bs.isTop())) {
                height -= ((double) bw / Constants.PIXELS_PER_INCH);
            }
        }

        retval.append(height);
        retval.append(units);
        retval.append(";\n");
        retval.append(c.getBorderSettings3().getBorderCss());
        retval.append("\n\t}\n");

        List<Map<String, Object>> dcols = (List<Map<String, Object>>) m.get("dataColumns");

        int dindx = 0;
        for (Map<String, Object> dc : dcols) {
            retval.append("\t.");
            retval.append("scomp-");
            retval.append(cindx);
            retval.append("-h");
            retval.append(dindx);
            retval.append(" {\n\t\ttext-align: ");
            retval.append(this.getStringMapValue("headerTextAlign", dc));
            retval.append(";\n\t\tposition: absolute;\n\t\tleft: ");
            retval.append(this.getStringMapValue("labelLeft", dc));
            retval.append(units);
            retval.append(";\n\t\ttop: ");
            retval.append(this.getStringMapValue("labelTop", dc));
            retval.append(units);
            retval.append(";\n\t\twidth: ");
            retval.append(this.getStringMapValue("labelWidth", dc));
            retval.append(units);
            retval.append(";\n\t\theight: ");
            retval.append(this.getStringMapValue("labelHeight", dc));
            retval.append(units);
            retval.append(";\n");
            retval.append(c.getFontSettings().getFontCss());
            retval.append(c.getBorderSettings().getBorderCss());
            retval.append("\t}\n");
            retval.append("\t.");
            retval.append("scomp-");
            retval.append(cindx);
            retval.append("-d");
            retval.append(dindx);
            retval.append(" {\n\t\tpadding-left: 5px;\n\t\ttext-align: ");
            retval.append(this.getStringMapValue("dataTextAlign", dc));
            retval.append(";\n\t\tposition: absolute;\n\t\tleft: ");
            retval.append(this.getStringMapValue("dataLeft", dc));
            retval.append(units);
            retval.append(";\n\t\ttop: ");
            retval.append(this.getStringMapValue("dataTop", dc));
            retval.append(units);
            retval.append(";\n\t\twidth: ");
            retval.append(this.getStringMapValue("dataWidth", dc));
            retval.append(units);
            retval.append(";\n\t\theight: ");
            retval.append(this.getStringMapValue("dataHeight", dc));
            retval.append(units);
            retval.append(";\n");
            retval.append(c.getFontSettings2().getFontCss());
            retval.append(c.getBorderSettings2().getBorderCss());
            retval.append("\t}\n");
            dindx++;
        }

        return retval.toString();
    }

    private String getDataRecordCss(ReportComponent c, int cindx, String units) {
        StringBuilder retval = new StringBuilder();
        Map<String, Object> m = (Map<String, Object>) c.getValue();
        List<Map<String, Object>> dcols = (List<Map<String, Object>>) m.get("dataColumns");

        retval.append("\n\t.");
        retval.append("comp-");
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
        retval.append(";\n\t\tposition: absolute;\n\t\tmargin: 0;\n\t\tpadding: 0;\n\t\tborder-collapse: collapse;\n");
        retval.append("\t}\n");

 
        double rowHeight = c.getHeight() / dcols.size();
        int dindx = 0;
        for (Map<String, Object> dc : dcols) {
            retval.append("\t.");
            retval.append("scomp-");
            retval.append(cindx);
            retval.append("-h");
            retval.append(dindx);
            retval.append(" {\n\t\ttext-align: ");
            retval.append(getStringMapValue("headerTextAlign", dc));
            retval.append(";\n\t\theight: ");
            retval.append(rowHeight);
            retval.append(units);
            retval.append(";\n");
            retval.append(c.getFontSettings().getFontCss());
            retval.append(c.getBorderSettings().getBorderCss());
            retval.append("\t}\n");

            retval.append("\t.");
            retval.append("scomp-");
            retval.append(cindx);
            retval.append("-d");
            retval.append(dindx);
            retval.append(" {\n\t\tpadding-left: 5px;\n\t\ttext-align: ");
            retval.append(getStringMapValue("dataTextAlign", dc));
            retval.append(";\n");
            retval.append(c.getFontSettings2().getFontCss());
            retval.append(c.getBorderSettings2().getBorderCss());
            retval.append("\t}\n");
            dindx++;
        }

        return retval.toString();
    }

    private String getDataComponentCss(ReportDocument report, ReportComponent c, int cindx, int gridRowSpan) {
        StringBuilder retval = new StringBuilder();
        String units = report.getPageUnits().substring(0, 2);

        switch (c.getType()) {
            case Constants.REPORT_COMPONENT_TYPE_DATA_FIELD_ID:
                retval.append(getDataFieldCss(c, cindx, units));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_RECORD_ID:
                retval.append(getDataRecordCss(c, cindx, units));
                break;
            case Constants.REPORT_COMPONENT_TYPE_DATA_GRID_ID:
                retval.append(getDataGridCss(c, cindx, units, gridRowSpan));
                break;
        }
        return retval.toString();
    }
    
    private void addFont(ITextRenderer renderer) {
        try {
            for (String f : Constants.PDF_EMBEDDED_FONT_FILES) {
                renderer.getFontResolver().addFont("fonts/" + f, BaseFont.IDENTITY_H, true);
            }
        }
        
        catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }
}
