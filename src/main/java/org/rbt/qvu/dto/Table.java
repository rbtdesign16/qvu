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
public class Table {
    private String datasource;
    private String name;
    private String type;
    private String schema;
    private String pkName;
    private List<Column> columns = new ArrayList<>();
    private List<ForeignKey> importedKeys = new ArrayList<>();
    private List<ForeignKey> exportedKeys = new ArrayList<>();

    public String getDatasource() {
        return datasource;
    }

    public void setDatasource(String datasource) {
        this.datasource = datasource;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Column> getColumns() {
        return columns;
    }

    public void setColumns(List<Column> columns) {
        this.columns = columns;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getPkName() {
        return pkName;
    }

    public void setPkName(String pkName) {
        this.pkName = pkName;
    }

    public String getCacheKey() {
        return datasource + "." + name;
    }

    public List<ForeignKey> getImportedKeys() {
        return importedKeys;
    }

    public void setImportedKeys(List<ForeignKey> importedKeys) {
        this.importedKeys = importedKeys;
    }

    public List<ForeignKey> getExportedKeys() {
        return exportedKeys;
    }

    public void setExportedKeys(List<ForeignKey> exportedKeys) {
        this.exportedKeys = exportedKeys;
    }

    
}
