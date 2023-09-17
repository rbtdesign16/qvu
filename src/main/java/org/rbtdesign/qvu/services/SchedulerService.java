package org.rbtdesign.qvu.services;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.util.QueryRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 *
 * @author rbtuc
 */
@Service
@PropertySource(value = "file:${repository.folder}/config/scheduler.properties", ignoreResourceNotFound = true)
public class SchedulerService implements AsyncConfigurer {
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    private MainService mainService;
    
    @Value("${scheduler.enabled:false}")
    private boolean schedulerEnabled;

    @Value("${max.scheduler.pool.size:10}")
    private int maxSchedulerPoolSize;

    @Value("${scheduler.execute.timeout.seconds:120}")
    private int schedulerExecuteTimeoutSeconds;


    @PostConstruct
    private void init() {
        LOG.info("in SchedulerService.init()");
        LOG.info("scheduler.enabled=" + schedulerEnabled);
        LOG.info("max.scheduler.pool.size=" + maxSchedulerPoolSize);
        LOG.info("scheduler.execute.timeout.seconds=" + schedulerExecuteTimeoutSeconds);
    }

    @Scheduled(fixedRateString = "${scheduler.fixed.rate:60000}", initialDelay = 60000)
    public void runScheduledJobs() throws InterruptedException {
        if (schedulerEnabled) {
            ExecutorService executor = Executors.newFixedThreadPool(maxSchedulerPoolSize);
             for (ScheduledDocument docinfo : getScheduledDocuments()) {
                executor.execute(new QueryRunner(mainService, docinfo));
            }
            executor.shutdown();
            try {
                if (!executor.awaitTermination(schedulerExecuteTimeoutSeconds, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
            } 
        }
    }

    private List<ScheduledDocument> getScheduledDocuments() {
        List<ScheduledDocument> retval = new ArrayList<>();

        return retval;
    }
}
