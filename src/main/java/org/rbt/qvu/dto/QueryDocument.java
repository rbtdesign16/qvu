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
    private String createdBy;
    private Timestamp createDate;
    private String datasource;
    private String baseTable;
    private List<SqlSelectColumn> selectColumns = new ArrayList<>();
    private List<SqlFilterColumn> filterColumns = new ArrayList<>();
    private List<SqlFrom> fromRecords = new ArrayList<>();
    private List<String> roles = new ArrayList<>();

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

    public List<SqlFrom> getFromRecords() {
        return fromRecords;
    }

    public void setFromRecords(List<SqlFrom> fromRecords) {
        this.fromRecords = fromRecords;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
    
    
    
    
    
}
