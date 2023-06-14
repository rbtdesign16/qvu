package org.rbt.qvu.services;

import java.sql.Connection;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MainServiceImpl implements MainService {
  private static Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    DataSource datasource;

    @Value("${spring.datasource.username}")
    String dbusername;

    @PostConstruct
    private void init() {
        LOG.info("MainServiceImpl loaded");
    }

    private Connection getConnection() {
        Connection retval = null;
        try {
            retval = datasource.getConnection();
        }

        catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    @Override
    public String getDatabaseInfo() {
        String retval = null;

        try (Connection conn = getConnection()) {
            retval = conn.getCatalog();
        } catch (Exception ex) {
            LOG.error("ChangeRequestService unable to get DB name: " + ex.getMessage());
        }

        if (retval == null) {
            retval = "NONE";
        }

        return retval;
    }

}
