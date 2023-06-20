/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import javax.sql.DataSource;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
public class DataSources {

    private static Logger LOG = LoggerFactory.getLogger(DataSources.class);
    private Map<String, HikariDataSource> dbDataSources = new HashMap<>();

    @Autowired
    private Config config;

    @PostConstruct
    private void init() {
        LOG.info("in QvuDataSource.init()");
        LOG.info("database config file: " + config.getAppConfig().getDatabaseConfigurationFile());

        try {
            loadDataSources();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    public DataSource getDataSource(String dsname) {
        return dbDataSources.get(dsname);
    }

    public Connection getConnection(String dsname) {
        Connection retval = null;
        try {
            retval = getDataSource(dsname).getConnection();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    public String getDatabaseInfo(String dsname) {
        String retval = null;

        try (Connection conn = getConnection(dsname)) {
            retval = conn.getCatalog();
            if (StringUtils.isEmpty(retval)) {
                retval = conn.getSchema();
            }
        } catch (Exception ex) {
            LOG.error("QvuDataSource - unable to get DB name for datasource[" + dsname + "]: " + ex.getMessage());
        }

        if (retval == null) {
            retval = Constants.NONE;
        }

        return retval;
    }

    public List<String> getAllDatabaseInfo() {
        List<String> retval = new ArrayList<>();

        for (String dsname : dbDataSources.keySet()) {
            retval.add(getDatabaseInfo(dsname));
        }

        Collections.sort(retval);

        return retval;
    }

    public void loadDataSources() {
        DataSourcesConfiguration dsc = config.getDatasourcesConfig();

        for (DataSourceConfiguration c : dsc.getDatasources()) {
            try {
                HikariConfig pconfig = new HikariConfig();
                pconfig.setJdbcUrl(c.getUrl());
                pconfig.setUsername(c.getUsername());
                pconfig.setPassword(c.getPassword());
                pconfig.setDriverClassName(c.getDriver());

                if (c.getConnectionTimeout() != null) {
                    pconfig.setConnectionTimeout(c.getConnectionTimeout());
                }

                if (c.getIdleTimeout() != null) {
                    pconfig.setIdleTimeout(c.getIdleTimeout());
                }

                if (c.getMaxLifeTime() != null) {
                    pconfig.setMaxLifetime(c.getMaxLifeTime());
                }

                if (c.getMaxPoolSize() != null) {
                    pconfig.setMaximumPoolSize(c.getMaxPoolSize());
                }

                
                dbDataSources.put(c.getDatasourceName(), new HikariDataSource(pconfig));
                c.setStatus(Constants.ONLINE);
            } catch (Exception ex) {
                c.setStatus(Constants.OFFLINE);
                LOG.error("error loading datasource " + c.getDatasourceName());
                LOG.error(ex.toString(), ex);
            }
        }
    }
}
