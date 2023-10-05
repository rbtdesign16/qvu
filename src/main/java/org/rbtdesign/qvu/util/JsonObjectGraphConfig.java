package org.rbtdesign.qvu.util;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class JsonObjectGraphConfig {
    private JsonObjectGraphConfig parent;
    private String alias;
    private String table;
    private String fieldName;
    private boolean importedForeignKey;
    private List<Integer> primaryKeyPositions = new ArrayList<>();
    private List<JsonObjectGraphConfig> children = new ArrayList<>();
    
    public JsonObjectGraphConfig(JsonObjectGraphConfig parent, String alias, String table, String fieldName, boolean importedForeignKey) {
        this.parent = parent;
        this.alias = alias;
        this.table = table;
        this.fieldName = fieldName;
        this.importedForeignKey = importedForeignKey;
    }
    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public boolean isImportedForeignKey() {
        return importedForeignKey;
    }

    public void setImportedForeignKey(boolean importedForeignKey) {
        this.importedForeignKey = importedForeignKey;
    }

    public List<Integer> getPrimaryKeyPositions() {
        return primaryKeyPositions;
    }

    public void setPrimaryKeyPositions(List<Integer> primaryKeyPositions) {
        this.primaryKeyPositions = primaryKeyPositions;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    private String buildKeyString(List<Object> row) {
        StringBuilder retval = new StringBuilder();
        
        String dot = "";
        for (Integer pos : primaryKeyPositions) {
            retval.append(dot);
            retval.append(row.get(pos));
            dot = ".";
        }
        
        return retval.toString();
    }

    public JsonObjectGraphConfig getParent() {
        return parent;
    }

    public List<JsonObjectGraphConfig> getChildren() {
        return children;
    }
}
