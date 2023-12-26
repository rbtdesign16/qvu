package org.rbtdesign.qvu.services;

import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ReportDocumentRunWrapper;
import org.rbtdesign.qvu.dto.ReportRunWrapper;

/**
 *
 * @author rbtuc
 */
public interface ReportService {
    public OperationResult<byte[]>  generateReport(ReportDocumentRunWrapper reportQrapper);
    public OperationResult<byte[]>  generateReport(ReportRunWrapper reportWrapper);

}
