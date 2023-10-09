package org.rbtdesign.qvu.services;

import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;

/**
 *
 * @author rbtuc
 */
public interface MailService {
    public void sendEmail(ScheduledDocument docinfo, SchedulerConfig schedulerConfig, byte[] attachment);
}
