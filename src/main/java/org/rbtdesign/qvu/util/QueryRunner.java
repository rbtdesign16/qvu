package org.rbtdesign.qvu.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.opencsv.CSVWriter;
import java.io.StringWriter;
import java.util.List;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;
import org.rbtdesign.qvu.services.MailService;
import org.rbtdesign.qvu.services.MainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class QueryRunner implements Runnable {
    private static final Logger LOG = LoggerFactory.getLogger(QueryRunner.class);
    private final SchedulerConfig schedulerConfig;
    private final ScheduledDocument docinfo;
    private final MainService mainService;
    private final MailService mailService;
    private final Gson prettyJson = new GsonBuilder().setPrettyPrinting().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").disableHtmlEscaping().create();

    public QueryRunner(MainService mainService, MailService mailService, SchedulerConfig schedulerConfig, ScheduledDocument docinfo) {
        this.docinfo = docinfo;
        this.schedulerConfig = schedulerConfig;
        this.mainService = mainService;
        this.mailService = mailService;
    }

    @Override
    public void run() {
        LOG.debug("running query for " + docinfo.getGroup() + ": " + docinfo.getDocument());
        try {
            OperationResult qres = null;
            switch (docinfo.getResultType()) {
                case Constants.RESULT_TYPE_EXCEL:
                case Constants.RESULT_TYPE_CSV:
                    qres = mainService.runQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
                case Constants.RESULT_TYPE_JSON_FLAT:
                    qres = mainService.runJsonQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
                case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                    qres = mainService.runJsonObjectGraphQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
            }

            if (qres != null) {
                if (qres.isSuccess()) {
                    mailService.sendEmail(docinfo, schedulerConfig, getAttachment(docinfo.getResultType(), qres.getResult()));
                } else {
                    LOG.error(qres.getMessage());
                }
            }

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    private byte[] getAttachment(String resultType, Object queryResult) throws Exception {
        byte[] retval = null;
        switch (resultType) {
            case Constants.RESULT_TYPE_EXCEL:
                retval = mainService.exportToExcel(getExcelWrapper((QueryResult) queryResult));
                break;
            case Constants.RESULT_TYPE_CSV:
                retval = Helper.toCsv((QueryResult) queryResult);
                break;
            case Constants.RESULT_TYPE_JSON_FLAT:
            case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                retval = prettyJson.toJson(queryResult).getBytes();
                break;
        }

        return retval;
    }


    private ExcelExportWrapper getExcelWrapper(QueryResult queryResult) {
        ExcelExportWrapper retval = new ExcelExportWrapper();

        retval.setHeaderFontColor("2F4F4F");
        retval.setHeaderBackgroundColor("85C1E9");
        retval.setHeaderFontSize(12);
        retval.setDetailFontColor("2F4F4F");
        retval.setDetailBackgroundColor1("FFFFFF");
        retval.setDetailBackgroundColor2("F0FFFF");
        retval.setDetailFontSize(11);

        retval.setQueryResults(queryResult);

        return retval;
    }

}
