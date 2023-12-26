package org.rbtdesign.qvu.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ReportRunWrapper;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;
import org.rbtdesign.qvu.services.MailService;
import org.rbtdesign.qvu.services.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class ReportRunner implements Runnable {
    private static final Logger LOG = LoggerFactory.getLogger(ReportRunner.class);
    private final SchedulerConfig schedulerConfig;
    private final ScheduledDocument docinfo;
    private final ReportService reportService;
    private final MailService mailService;

    public ReportRunner(ReportService reportService, MailService mailService, SchedulerConfig schedulerConfig, ScheduledDocument docinfo) {
        this.docinfo = docinfo;
        this.schedulerConfig = schedulerConfig;
        this.mailService = mailService;
        this.reportService = reportService;
    }

    @Override
    public void run() {
        
        LOG.debug("running report for " + docinfo.getGroup() + ": " + docinfo.getDocument());
        try {
            OperationResult<byte[]> res = reportService.generateReport(new ReportRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
            if (res != null) {
                if (res.isSuccess()) {
                    mailService.sendEmail(docinfo, schedulerConfig, res.getResult());
                } else {
                    LOG.error(res.getMessage());
                }
            }

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

}
