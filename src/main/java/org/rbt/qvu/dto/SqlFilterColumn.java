/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class SqlFilterColumn {
    private String datasource;
    private String tableName;
    private String columnName;
    private String openParenthesis;
    private String closeParenthesis;
    private String andOr;
    private String comparisonOperator;
    private String comparisonValue;

    public String getDatasource() {
        return datasource;
    }

    public void setDatasource(String datasource) {
        this.datasource = datasource;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getComparisonOperator() {
        return comparisonOperator;
    }

    public void setComparisonOperator(String comparisonOperator) {
        this.comparisonOperator = comparisonOperator;
    }

    public String getComparisonValue() {
        return comparisonValue;
    }

    public void setComparisonValue(String comparisonValue) {
        this.comparisonValue = comparisonValue;
    }

    public String getOpenParenthesis() {
        return openParenthesis;
    }

    public void setOpenParenthesis(String openParenthesis) {
        this.openParenthesis = openParenthesis;
    }

    public String getCloseParenthesis() {
        return closeParenthesis;
    }

    public void setCloseParenthesis(String closeParenthesis) {
        this.closeParenthesis = closeParenthesis;
    }

    public String getAndOr() {
        return andOr;
    }

    public void setAndOr(String andOr) {
        this.andOr = andOr;
    }
    
    
}