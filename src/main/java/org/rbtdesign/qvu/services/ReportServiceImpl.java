package org.rbtdesign.qvu.services;

import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.dto.ReportDocument;
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
    public byte[] generateReport(String user, String group, String name) {
        return null;
    }
    

    @Override
    public byte[] generateReport(ReportDocument report) {
        return null;
    }
}
