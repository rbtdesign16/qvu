/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryDocument {
    private String name;
    private String path;
    private String createdBy;
    private String updatedBy;
    private Timestamp createDate;
    private Timestamp lastUpdated;
    private String datasource;
    private String databaseType;
    private String baseTable;
    private String savedDocumentGroupName;
    private String documentGroupName;
    private boolean newRecord;
    private List<SqlSelectColumn> selectColumns = new ArrayList<>();
    private List<SqlFilterColumn> filterColumns = new ArrayList<>();
    private List<SqlFrom> fromClause = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public String getDatasource() {
        return datasource;
    }

    public void setDatasource(String datasource) {
        this.datasource = datasource;
    }

    public String getBaseTable() {
        return baseTable;
    }

    public void setBaseTable(String baseTable) {
        this.baseTable = baseTable;
    }

    public List<SqlSelectColumn> getSelectColumns() {
        return selectColumns;
    }

    public void setSelectColumns(List<SqlSelectColumn> selectColumns) {
        this.selectColumns = selectColumns;
    }

    public List<SqlFilterColumn> getFilterColumns() {
        return filterColumns;
    }

    public void setFilterColumns(List<SqlFilterColumn> filterColumns) {
        this.filterColumns = filterColumns;
    }

    public List<SqlFrom> getFromClause() {
        return fromClause;
    }

    public void setFromClause(List<SqlFrom> fromClause) {
        this.fromClause = fromClause;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDocumentGroupName() {
        return documentGroupName;
    }

    public void setDocumentGroupName(String documentGroupName) {
        this.documentGroupName = documentGroupName;
    }

    public boolean isNewRecord() {
        return newRecord;
    }

    public void setNewRecord(boolean newRecord) {
        this.newRecord = newRecord;
    }

    public String getSavedDocumentGroupName() {
        return savedDocumentGroupName;
    }

    public void setSavedDocumentGroupName(String savedDocumentGroupName) {
        this.savedDocumentGroupName = savedDocumentGroupName;
    }

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(String databaseType) {
        this.databaseType = databaseType;
    }
    
    
 }
