/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DocumentGroup {
    private String name;
    private String description;
    private boolean newRecord;
    private List<String> roles = new ArrayList<>();
    private List<String> queryDocuments = new ArrayList<>();
    private List<String> reportDocuments = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getQueryDocuments() {
        return queryDocuments;
    }

    public void setQueryDocuments(List<String> queryDocuments) {
        this.queryDocuments = queryDocuments;
    }

    public List<String> getReportDocuments() {
        return reportDocuments;
    }

    public void setReportDocuments(List<String> reportDocuments) {
        this.reportDocuments = reportDocuments;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isNewRecord() {
        return newRecord;
    }

    public void setNewRecord(boolean newRecord) {
        this.newRecord = newRecord;
    }
    
    
}
