package org.rbtdesign.qvu.services;

import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.client.utils.OperationResult;
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
        return null;
    }
}
