/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.HashMap;
import java.util.Map;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
import org.rbt.qvu.dto.ColumnSettings;
import org.rbt.qvu.dto.TableSettings;

/**
 *
 * @author rbtuc
 */
public class DatasourceSettingsHelper {
    private String datasourceName;
    private Map<String, TableSettings> datasourceTableSettings = new HashMap<>();
    private Map<String, ColumnSettings> datasourceColumnSettings = new HashMap<>();

    public String getDatasourceName() {
        return datasourceName;
    }

    public void setDatasourceName(String datasourceName) {
        this.datasourceName = datasourceName;
    }

    public Map<String, TableSettings> getDatasourceTableSettings() {
        return datasourceTableSettings;
    }

    public void setDatasourceTableSettings(Map<String, TableSettings> datasourceTableSettings) {
        this.datasourceTableSettings = datasourceTableSettings;
    }

    public Map<String, ColumnSettings> getDatasourceColumnSettings() {
        return datasourceColumnSettings;
    }

    public void setDatasourceColmnSettings(Map<String, ColumnSettings> datasourceColumnSettings) {
        this.datasourceColumnSettings = datasourceColumnSettings;
    }

    
    public TableSettings getTableSettings(String key) {
        return datasourceTableSettings.get(key);
    }
    
    public ColumnSettings getColumnSettings(String key) {
        return datasourceColumnSettings.get(key);
    }
    
    public synchronized void load(DataSourcesConfiguration dsconfig) {
        datasourceTableSettings.clear();
        datasourceColumnSettings.clear();
        for (DataSourceConfiguration ds : dsconfig.getDatasources()) {
            for (TableSettings ts : ds.getDatasourceTableSettings()) {
                datasourceTableSettings.put(ts.getCacheKey(), ts);
                
                for (ColumnSettings cs : ts.getTableColumnSettings()) {
                    datasourceColumnSettings.put(cs.getCacheKey(), cs);
                }
            }
        }
    }
}
