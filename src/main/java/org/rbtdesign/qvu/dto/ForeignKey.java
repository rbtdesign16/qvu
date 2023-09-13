package org.rbtdesign.qvu.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class ForeignKey implements Serializable {
    private String name;
    private String datasourceName;
    private String tableName;
    private String toTableName;
    private boolean custom;
    private boolean imported;
    private List<String> columns = new ArrayList();
    private List<String> toColumns = new ArrayList<>();
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

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

    public String getToTableName() {
        return toTableName;
    }

    public void setToTableName(String toTableName) {
        this.toTableName = toTableName;
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

    public boolean isImported() {
        return imported;
    }

    public void setImported(boolean imported) {
        this.imported = imported;
    }
    
    public String getTableCacheKey() {
        return datasourceName + "." + tableName;
    }
    
    public String getToTableCacheKey() {
        return datasourceName + "." + toTableName;
    }

    public boolean isCustom() {
        return custom;
    }

    public void setCustom(boolean custom) {
        this.custom = custom;
    }

}
