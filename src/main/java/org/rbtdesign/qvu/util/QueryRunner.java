package org.rbtdesign.qvu.util;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.services.MainService;
import org.rbtdesign.qvu.services.SchedulerService;
import static org.rbtdesign.qvu.util.Constants.RESULT_TYPE_JSON_OBJECTGRAPH;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
@Scope("prototype")
public class QueryRunner implements Runnable {
    private ScheduledDocument docinfo;

    @Autowired
    private MainService mainService;

    @Autowired
    private SchedulerService schedulerService;

    public QueryRunner(ScheduledDocument docinfo) {
        this.docinfo = docinfo;
    }

    @Override
    public void run() {
        OperationResult qres = null;
        switch (docinfo.getResultType()) {
            case Constants.RESULT_TYPE_EXCEL:
            case Constants.RESULT_TYPE_CSV:
                qres = mainService.runQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                break;
            case Constants.RESULT_TYPE_JSON_FLAT:
                qres = mainService.runJsonQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                break;
            case RESULT_TYPE_JSON_OBJECTGRAPH:
                qres = mainService.runJsonObjectGraphQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                break;
        }

        if ((qres != null) && qres.isSuccess()) {
            schedulerService.sendEmail(docinfo, qres.getResult());
        }
    }

}
