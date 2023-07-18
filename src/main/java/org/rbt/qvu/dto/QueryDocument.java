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
    private Timestamp lastUpdatedDate;
    private String datasource;
    private String baseTable;
    private List<SqlSelectColumn> selectColumns = new ArrayList<>();
    private List<SqlFilterColumn> filterColumns = new ArrayList<>();
    private List<SqlFrom> fromRecords = new ArrayList<>();
    private List<String> roles = new ArrayList<>();

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

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Timestamp getLastUpdatedDate() {
        return lastUpdatedDate;
    }

    public void setLastUpdatedDate(Timestamp lastUpdatedDate) {
        this.lastUpdatedDate = lastUpdatedDate;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
 }
