/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.database;

import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DataSourcesConfiguration {
    public static final String[] DATABASE_TYPES = {"MySQL", "Microsoft SQL Server", "Oracle", "PostgreSQL"};
    private List<DataSourceConfiguration> datasources;

    public List<DataSourceConfiguration> getDatasources() {
        return datasources;
    }

    public void setDatasources(List<DataSourceConfiguration> datasources) {
        this.datasources = datasources;
    }
    
    
}
