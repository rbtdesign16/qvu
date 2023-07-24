/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.sql.Timestamp;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DocumentWrapper {
    private String userId;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
    
    
    
}
