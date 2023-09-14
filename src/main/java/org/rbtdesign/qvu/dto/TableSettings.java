package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class TableSettings implements Comparable<TableSettings> {
    private String datasourceName;
    private String displayName;
    private String tableName;
    private boolean hide;
    private List<String> roles = new ArrayList<>();
    private List <ColumnSettings> tableColumnSettings = new ArrayList<>();
    private List <ForeignKeySettings> foreignKeySettings = new ArrayList<>();

    @Override
    public int compareTo(TableSettings o) {
        return tableName.compareTo(o.getTableName());
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isHide() {
        return hide;
    }

    public void setHide(boolean hide) {
        this.hide = hide;
    }

    public List<ColumnSettings> getTableColumnSettings() {
        return tableColumnSettings;
    }

    public void setTableColumnSettings(List<ColumnSettings> tableColumnSettings) {
        this.tableColumnSettings = tableColumnSettings;
    }
    
    public String getCacheKey() {
        return datasourceName + "." + tableName;
    }

    public List<ForeignKeySettings> getForeignKeySettings() {
        return foreignKeySettings;
    }

    public void setForeignKeySettings(List<ForeignKeySettings> foreignKeySettings) {
        this.foreignKeySettings = foreignKeySettings;
    }
    
    
}
