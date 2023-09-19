package org.rbtdesign.qvu.configuration.document;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.dto.DocumentSchedule;

/**
 *
 * @author rbtuc
 */
public class DocumentSchedulesConfiguration {
    private long lastUpdated;
    
    private List<DocumentSchedule> documentSchedules = new ArrayList<>();

    public List<DocumentSchedule> getDocumentSchedules() {
        return documentSchedules;
    }

    public void setDocumentSchedules(List<DocumentSchedule> documentSchedules) {
        this.documentSchedules = documentSchedules;
    }

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
