package org.rbt.qvu.controllers;

import java.util.List;
import javax.annotation.PostConstruct;

import org.rbt.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.util.AuthHelper;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * The type Main controller.
 */
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MainController {
    private static Logger LOG = LogManager.getLogger(MainController.class);

    @Autowired
    MainService service;

    @PostConstruct
    private void init() {
        LOG.info("in MainController.init()");
    }

    @GetMapping("api/v1/auth/data/load")
    public AuthData loadAuthData() {
        LOG.debug("in loadAuthData()");
        AuthData retval = null;
        try {
            retval = service.loadAuthData();
            // make sure we do not send password across the wire
            AuthHelper.removePasswords(retval);
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

    @PostMapping("api/v1/auth/role/save")
    public OperationResult saveRole(@RequestBody Role role) {
        LOG.debug("in saveRole()");
        return service.saveRole(role);
    }

    @DeleteMapping("api/v1/auth/role/{roleName}")
    public OperationResult deleteRole(@PathVariable String roleName) {
        LOG.debug("in deleteRole(" + roleName + ")");
        return service.deleteRole(roleName);
    }

    @PostMapping("api/v1/auth/user/save")
    public OperationResult saveUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @DeleteMapping("api/v1/auth/user/{userId}")
    public OperationResult deleteUser(@PathVariable String userId) {
        LOG.debug("in deleteUser(" + userId + ")");
        return service.deleteUser(userId);
    }

    @PostMapping("api/v1/db/datasource/save")
    public OperationResult saveDatasource(@RequestBody DataSourceConfiguration datasource) {
        LOG.debug("in saveDatasource()");
        return service.saveDatasource(datasource);
    }

    @PostMapping("api/v1/db/datasource/test")
    public OperationResult testDatasource(@RequestBody DataSourceConfiguration datasource) {
        LOG.debug("in testDatasource()");
        return service.testDatasource(datasource);
    }


    @DeleteMapping("api/v1/db/datasource/{datasourceName}")
    public OperationResult deleteDatasource(@PathVariable String datasourceName) {
        LOG.debug("in deleteDatasource(" + datasourceName + ")");
        return service.deleteDatasource(datasourceName);
    }

    @GetMapping("api/v1/lang/{langkey}/load")
    public String loadLang(@PathVariable String langkey) {
        LOG.debug("in loadLang(" + langkey + ")");
        return service.loadLang(langkey);
    }

    @GetMapping("api/v1/repo/init/verify")
    public OperationResult verifyRepositoryFolder(@RequestParam String folder) {
        LOG.debug("in verifyRepositoryFolder(" + folder + ")");
        return service.verifyInitialRepositoryFolder(folder);
    }

    @PostMapping("api/v1/repo/initialize")
    public OperationResult doInitialSetup(@RequestBody InitialSetup initialSetup) {
        LOG.debug("in doInitialSetup()");
        return service.doInitialSetup(initialSetup);
    }

    
    @GetMapping("api/v1//db/datasource/{datasourceName}/tables")
    public List<Table> getDatasourceTables(@RequestParam String datasourceName) {
        LOG.debug("in getDatasourceTables(" + datasourceName + ")");
        return service.getDatasourceTables(datasourceName);
    }
}
