package org.rbt.qvu.controllers;

import java.util.List;
import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.rbt.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PostConstruct
    private void init() {
        LOG.info("in MainController.init()");
    }

    @GetMapping("api/v1/db/info/{dsname}")
    public String getDatabaseInfo(@PathVariable String dsname) {
        LOG.debug("getDatabaseInfo called");
        return service.getDatabaseInfo(dsname);
    }

    @GetMapping("api/v1/db/all/info")
    public List<String> getAllDatabaseInfo() {
        LOG.debug("getDatabaseInfo called");
        return service.getAllDatabaseInfo();
    }

}
