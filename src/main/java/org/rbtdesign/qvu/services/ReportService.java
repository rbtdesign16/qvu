package org.rbtdesign.qvu.services;

import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ReportDocument;

/**
 *
 * @author rbtuc
 */
public interface ReportService {
    public OperationResult<byte[]>  generateReport(ReportDocument report);
    public OperationResult<byte[]>  generateReport(String user, String group, String name);

}
