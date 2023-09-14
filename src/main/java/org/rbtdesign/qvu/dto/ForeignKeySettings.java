package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class ForeignKeySettings implements Comparable<ForeignKeySettings> {
    private String datasourceName;
    private String tableName;
    private String foreignKeyName;
    private String toTableName;
    private String displayName;
    private String fieldName;
    private String type;
    private List<String> columns = new ArrayList<>();;
    private List<String> toColumns = new ArrayList<>();

    public String getDatasourceName() {
        return datasourceName;
    }

    public void setDatasourceName(String datasourceName) {
        this.datasourceName = datasourceName;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getForeignKeyName() {
        return foreignKeyName;
    }

    public void setForeignKeyName(String foreignKeyName) {
        this.foreignKeyName = foreignKeyName;
    }

    public String getToTableName() {
        return toTableName;
    }

    public void setToTableName(String toTableName) {
        this.toTableName = toTableName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getColumns() {
        return columns;
    }

    public void setColumns(List<String> columns) {
        this.columns = columns;
    }

    public List<String> getToColumns() {
        return toColumns;
    }

    public void setToColumns(List<String> toColumns) {
        this.toColumns = toColumns;
    }

    @Override
    public int compareTo(ForeignKeySettings o) {
        int retval = -type.compareTo(o.getType());
        
        if (retval == 0) {
            retval = foreignKeyName.compareTo(o.getForeignKeyName());
        }
        
        return retval;
    }

    public String getCacheKey() {
        return datasourceName + "." + tableName + "." + foreignKeyName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

}
