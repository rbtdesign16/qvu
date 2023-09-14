package org.rbtdesign.qvu.dto;

import java.sql.Timestamp;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DocumentWrapper {
    private String user;
    private Timestamp actionTimestamp;
    private String group;
    private List<String> queryParameters;
    private QueryDocument queryDocument;
    private ReportDocument reportDocument;

    public List<String> getQueryParameters() {
        return queryParameters;
    }

    public void setQueryParameters(List<String> queryParameters) {
        this.queryParameters = queryParameters;
    }

    public QueryDocument getQueryDocument() {
        return queryDocument;
    }

    public void setQueryDocument(QueryDocument queryDocument) {
        this.queryDocument = queryDocument;
    }

    public ReportDocument getReportDocument() {
        return reportDocument;
    }

    public void setReportDocument(ReportDocument reportDocument) {
        this.reportDocument = reportDocument;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public Timestamp getActionTimestamp() {
        return actionTimestamp;
    }

    public void setActionTimestamp(Timestamp actionTimestamp) {
        this.actionTimestamp = actionTimestamp;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
    
    
    
}
