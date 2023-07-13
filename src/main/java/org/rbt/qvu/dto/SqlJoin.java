/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class SqlJoin {
    private String table;
    private String type;
    private String alias;
    private List <String> fromColumns = new ArrayList<>();
    private List <String> toColumns = new ArrayList<>();

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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
    
    
}
