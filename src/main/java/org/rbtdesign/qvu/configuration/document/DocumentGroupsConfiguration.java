package org.rbtdesign.qvu.configuration.document;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.dto.DocumentGroup;

/**
 *
 * @author rbtuc
 */
public class DocumentGroupsConfiguration {
    private long lastUpdated;
    
    private List<DocumentGroup> documentGroups = new ArrayList<>();

    public List<DocumentGroup> getDocumentGroups() {
        return documentGroups;
    }

    public void setDocumentGroups(List<DocumentGroup> documentGroups) {
        this.documentGroups = documentGroups;
    }

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
