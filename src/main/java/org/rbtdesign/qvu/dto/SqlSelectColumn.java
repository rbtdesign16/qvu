package org.rbtdesign.qvu.dto;

import java.io.Serializable;

/**
 *
 * @author rbtuc
 */
public class SqlSelectColumn implements Serializable {
    private String datasource;
    private String tableName;
    private int dataType;
    private String dataTypeName;
    private String tableAlias;
    private String columnName;
    private String displayName;
    private int sortPosition = -1;
    private String sortDirection;
    private Integer pkIndex = 0;
    private boolean showInResults = true;
    private String aggregateFunction;
    private String customSql;
    private String path;
    private Integer selectPosition;

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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public int getSortPosition() {
        return sortPosition;
    }

    public void setSortPosition(int sortPosition) {
        this.sortPosition = sortPosition;
    }

    public String getAggregateFunction() {
        return aggregateFunction;
    }

    public void setAggregateFunction(String aggregateFunction) {
        this.aggregateFunction = aggregateFunction;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getCustomSql() {
        return customSql;
    }

    public void setCustomSql(String customSql) {
        this.customSql = customSql;
    }

    public String getTableAlias() {
        return tableAlias;
    }

    public void setTableAlias(String tableAlias) {
        this.tableAlias = tableAlias;
    }

    public int getDataType() {
        return dataType;
    }

    public void setDataType(int dataType) {
        this.dataType = dataType;
    }

    public String getDataTypeName() {
        return dataTypeName;
    }

    public void setDataTypeName(String dataTypeName) {
        this.dataTypeName = dataTypeName;
    }

    public Integer getPkIndex() {
        return pkIndex;
    }

    public void setPkIndex(int pkIndex) {
        this.pkIndex = pkIndex;
    }

    public boolean isShowInResults() {
        return showInResults;
    }

    public void setShowInResults(boolean showInResults) {
        this.showInResults = showInResults;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    public Integer getSelectPosition() {
        return selectPosition;
    }

    public void setSelectPosition(Integer selectPosition) {
        this.selectPosition = selectPosition;
    }

}
