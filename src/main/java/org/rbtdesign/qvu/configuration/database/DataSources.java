package org.rbtdesign.qvu.configuration.database;

import com.google.gson.Gson;
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
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.util.Constants;
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
    private ConfigurationHelper config;

    @PostConstruct
    private void init() {
        LOG.info("in QvuDataSource.init()");

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
            DataSource ds = getDataSource(dsname);

            if (ds != null) {
                retval = ds.getConnection();
            } else {
                LOG.warn("datasource " + dsname + " does not exist");
            }
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

    public void reloadDatasource(DataSourceConfiguration c) {
        HikariDataSource ds = dbDataSources.get(c.getDatasourceName());

        if (ds != null) {
            ds.close();
        }

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
    }

    public void loadDataSources() {
        DataSourcesConfiguration dsc = config.getDatasourcesConfig();
        if (LOG.isTraceEnabled()) {
            LOG.trace("datasources: " + new Gson().toJson(dsc, DataSourcesConfiguration.class));
        }

        for (DataSourceConfiguration c : dsc.getDatasources()) {
            if (c.isEnabled()) {
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

}
