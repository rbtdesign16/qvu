package org.rbtdesign.qvu.services;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 *
 * @author rbtuc
 */
@Service
@PropertySource(value = "file:${repository.folder}/config/scheduler.properties", ignoreResourceNotFound = true)
public class SchedulerService {
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Value("${scheduler.enabled:false}")
    private boolean schedulerEnabled;

    @Autowired
    private MainService service;
    
    @PostConstruct
    private void init() {
        LOG.info("in ShedulerService.init()");
    }
    
    

    @Scheduled(fixedRateString = "${scheduler.fixed.rate:60000}", initialDelay = 60000)
    public void runScheduledJobs() throws InterruptedException {
        if (schedulerEnabled) {
            for (ScheduledDocument docinfo : getScheduledDocuments()) {
                service.runScheduledDocument(docinfo);
            }
        }
    }
    
    private List<ScheduledDocument> getScheduledDocuments() {
        List <ScheduledDocument> retval = new ArrayList<>();
        
        return retval;
    }
}
