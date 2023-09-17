package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryRunWrapper {
    private List<QueryParameter> parameters = new ArrayList<>();
    private String user;
    private String documentName;
    private String groupName;

    public QueryRunWrapper(String user, String groupName, String documentName,List<QueryParameter> parameters) {
        this.user = user;
        this.groupName = groupName;
        this.documentName = documentName;
        this.parameters = parameters;
    }
    
    public QueryRunWrapper() {};
    
    public List<QueryParameter> getParameters() {
        return parameters;
    }

    public void setParameters(List<QueryParameter> parameters) {
        this.parameters = parameters;
    }

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

}
