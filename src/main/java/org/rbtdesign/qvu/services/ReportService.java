package org.rbtdesign.qvu.services;

import org.rbtdesign.qvu.dto.ReportDocument;

/**
 *
 * @author rbtuc
 */
public interface ReportService {
    public byte[] generateReport(ReportDocument report);
    public byte[] generateReport(String user, String group, String name);

}
