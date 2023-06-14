/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.services;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.StringTokenizer;
import javax.annotation.PostConstruct;
import javax.sql.DataSource;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Messages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
@PropertySource("classpath:application.properties")
public class QvuDataSource {

    private static Logger LOG = LoggerFactory.getLogger(QvuDataSource.class);
    private Map<String, HikariDataSource> dbDataSources = new HashMap<>();

    @Value("${database.config}")
    private String databaseConfigFile;

    @PostConstruct
    private void init() {
        LOG.info("in QvuDataSource.init()");
        LOG.info("database config file: " + databaseConfigFile);
        try (InputStream is = new FileInputStream(databaseConfigFile)) {
            Properties p = new Properties();
            p.load(is);

            String datasources = p.getProperty(Constants.DB_DATASOURCES_PROPERTY);
            if (StringUtils.isEmpty(datasources)) {
                throw new Exception(Messages.INVALID_DATABASE_CONFIGURATION_NO_DATASOURCES);
            }

            StringTokenizer st = new StringTokenizer(datasources, ",");

            while (st.hasMoreTokens()) {
                String ds = st.nextToken().trim();
                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(p.getProperty(ds + ".dburl"));
                config.setUsername(p.getProperty(ds + ".dbusername"));
                config.setPassword(p.getProperty(ds + ".dbpassword"));
                config.setDriverClassName(p.getProperty(ds + ".dbdriver"));

                String connectionTimeout = p.getProperty(ds + ".connecton.timeout");
                String idleTimeout = p.getProperty(ds + ".idle.timeout");
                String maxLifeTime = p.getProperty(ds + ".max.lifetime");
                String maxPoolSize = p.getProperty(ds + ".max.poolsize");

                if (StringUtils.isNotEmpty(connectionTimeout)) {
                    config.setConnectionTimeout(Long.parseLong(connectionTimeout));
                }

                if (StringUtils.isNotEmpty(idleTimeout)) {
                    config.setIdleTimeout(Long.parseLong(idleTimeout));
                }

                if (StringUtils.isNotEmpty(maxLifeTime)) {
                    config.setMaxLifetime(Long.parseLong(maxLifeTime));
                }

                if (StringUtils.isNotEmpty(maxPoolSize)) {
                    config.setMaximumPoolSize(Integer.parseInt(maxPoolSize));
                }

                dbDataSources.put(ds, new HikariDataSource(config));
            }

            LOG.info("datasources"
            );
            for (String db : getAllDatabaseInfo()) {
                LOG.info("\tdatabase: " + db);
            }
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
            retval = "NONE";
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

}
