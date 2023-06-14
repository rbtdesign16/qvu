package org.rbt.qvu.controllers;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.rbt.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The type Main controller.
 */
@RestController
@CrossOrigin(origins = "*")
public class MainController {
  private static Logger LOG = LoggerFactory.getLogger(MainController.class);

    @Autowired
    MainService service;

    @Autowired
    DataSource datasource;

    @PostConstruct
    private void init() {
        LOG.info("MainController loaded");
    }

    @GetMapping("api/v1/db/info")
    public String getDatabaseInfo() {
        LOG.debug("getDatabaseInfo called");
        return service.getDatabaseInfo();
    }
}
