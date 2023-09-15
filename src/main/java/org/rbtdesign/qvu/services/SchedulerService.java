package org.rbtdesign.qvu.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 *
 * @author rbtuc
 */
@Service
public class SchedulerService  {
  @Scheduled(fixedDelay = 30000)
  public void runJobs() throws InterruptedException {
      System.out.println("----------->in runJobs");
  }  
}
