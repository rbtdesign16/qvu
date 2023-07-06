/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.database;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.util.DBHelper;

/**
 *
 * @author rbtuc
 */
public class DataSourcesConfiguration {
    
    public static final String[] DATABASE_TYPES = {
        DBHelper.DB_TYPE_MYSQL, 
        DBHelper.DB_TYPE_SQLSERVER, 
        DBHelper.DB_TYPE_ORACLE, 
        DBHelper.DB_TYPE_POSTGRES
    };
    
    private List<DataSourceConfiguration> datasources = new ArrayList<>();

    public List<DataSourceConfiguration> getDatasources() {
        return datasources;
    }

    public void setDatasources(List<DataSourceConfiguration> datasources) {
        this.datasources = datasources;
    }
    
    public DataSourceConfiguration getDatasourceConfiguration(String name) {
        DataSourceConfiguration retval = null;
        
        if (datasources != null) {
            for (DataSourceConfiguration ds : datasources) {
                if (name.equals(ds.getDatasourceName())) {
                    retval = ds;
                    break;
                }
            }
        }
        
        return retval;
    }
        
    
}
