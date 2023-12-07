package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class ReportRunWrapper {
    private List<String> parameters = new ArrayList<>();
    private String user;
    private String documentName;
    private String groupName;

    public ReportRunWrapper(String user, String groupName, String documentName,List<String> parameters) {
        this.user = user;
        this.groupName = groupName;
        this.documentName = documentName;
        this.parameters = parameters;
    }
    
    public ReportRunWrapper() {};
    
    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public List<String> getParameters() {
        return parameters;
    }

    public void setParameters(List<String> parameters) {
        this.parameters = parameters;
    }

    
}
