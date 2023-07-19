/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.document;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.dto.DocumentGroup;
import org.rbt.qvu.util.DocumentGroupComparator;

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
