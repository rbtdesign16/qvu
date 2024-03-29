package org.rbtdesign.qvu.configuration.database;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author rbtuc
 */
public class DataSourcesConfiguration {
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

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    
}
