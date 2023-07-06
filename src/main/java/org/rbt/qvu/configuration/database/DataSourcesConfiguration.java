/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.database;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.rbt.qvu.util.DBHelper;

/**
 *
 * @author rbtuc
 */
public class DataSourcesConfiguration {
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
}
