package org.rbtdesign.qvu.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class SqlFrom implements Serializable {
    private String table;
    private String joinType;
    private String foreignKeyName;
    private boolean importedForeignKey;
    private String alias;
    private String fromAlias;
    private List <String> fromColumns = new ArrayList<>();
    private List <String> toColumns = new ArrayList<>();

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public List<String> getFromColumns() {
        return fromColumns;
    }

    public void setFromColumns(List<String> fromColumns) {
        this.fromColumns = fromColumns;
    }

    public List<String> getToColumns() {
        return toColumns;
    }

    public void setToColumns(List<String> toColumns) {
        this.toColumns = toColumns;
    }

    public String getJoinType() {
        return joinType;
    }

    public void setJoinType(String joinType) {
        this.joinType = joinType;
    }

    public String getFromAlias() {
        return fromAlias;
    }

    public void setFromAlias(String fromAlias) {
        this.fromAlias = fromAlias;
    }

    public String getForeignKeyName() {
        return foreignKeyName;
    }

    public void setForeignKeyName(String foreignKeyName) {
        this.foreignKeyName = foreignKeyName;
    }

    public boolean isImportedForeignKey() {
        return importedForeignKey;
    }

    public void setImportedForeignKey(boolean importedForeignKey) {
        this.importedForeignKey = importedForeignKey;
    }


}
