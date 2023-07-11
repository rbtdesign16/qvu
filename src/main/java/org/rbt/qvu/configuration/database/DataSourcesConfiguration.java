/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.database;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author rbtuc
 */
public class DataSourcesConfiguration {
    private int maxImportedKeyDepth = 2;
    private int maxExportedKeyDepth = 4;
    private long lastUpdated;
    
    private static final Map<String, DataSourceConfiguration> DSMAP = new HashMap<>();

    private List<DataSourceConfiguration> datasources = new ArrayList<>();

    public List<DataSourceConfiguration> getDatasources() {
        return datasources;
    }

    public void setDatasources(List<DataSourceConfiguration> datasources) {
        this.datasources = datasources;
        loadDsMap();
    }

    public DataSourceConfiguration getDatasourceConfiguration(String name) {
        return DSMAP.get(name);
    }
    
    public void postConstruct() {
        loadDsMap();
    }
    
    private void loadDsMap() {
        DSMAP.clear();

        for (DataSourceConfiguration ds : datasources) {
            DSMAP.put(ds.getDatasourceName(), ds);
        }
    }

    public int getMaxImportedKeyDepth() {
        return maxImportedKeyDepth;
    }

    public void setMaxImportedKeyDepth(int maxImportedKeyDepth) {
        this.maxImportedKeyDepth = maxImportedKeyDepth;
    }

    public int getMaxExportedKeyDepth() {
        return maxExportedKeyDepth;
    }

    public void setMaxExportedKeyDepth(int maxExportedKeyDepth) {
        this.maxExportedKeyDepth = maxExportedKeyDepth;
    }

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    
}
