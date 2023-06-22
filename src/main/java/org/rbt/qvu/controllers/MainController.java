package org.rbt.qvu.controllers;

import java.util.List;
import javax.annotation.PostConstruct;

import org.rbt.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;

/**
 * The type Main controller.
 */
@RestController
@CrossOrigin(origins = "*")
public class MainController {

    private static Logger LOG = LogManager.getLogger(MainController.class);

    @Autowired
    MainService service;

    @PostConstruct
    private void init() {
        LOG.info("in MainController.init()");
    }

    @GetMapping("api/v1/db/info/{dsname}")
    public String getDatabaseInfo(@PathVariable String dsname) {
        return service.getDatabaseInfo(dsname);
    }

    @GetMapping("api/v1/db/all/info")
    public List<String> getAllDatabaseInfo() {
        return service.getAllDatabaseInfo();
    }

    @GetMapping("api/v1/auth/data/load")
    public AuthData loadAuthData() {
        LOG.debug("in loadAuthData()");
        AuthData retval = null;
        try {
            retval = service.loadAuthData();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
        
        return retval;
    }
    
    @GetMapping("api/v1/db/datasources/load")
    public List<DataSourceConfiguration> loadDatasources() {
        LOG.debug("in loadDatasources()");
        
        return service.loadDatasources();
    }
}
