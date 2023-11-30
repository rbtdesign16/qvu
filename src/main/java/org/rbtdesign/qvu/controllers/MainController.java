package org.rbtdesign.qvu.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.User;
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentSchedulesConfiguration;
import org.rbtdesign.qvu.dto.AuthData;
import org.rbtdesign.qvu.dto.ColumnSettings;
import org.rbtdesign.qvu.dto.DocumentGroup;
import org.rbtdesign.qvu.dto.DocumentNode;
import org.rbtdesign.qvu.dto.DocumentWrapper;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.ForeignKeySettings;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryDocumentRunWrapper;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.QuerySelectNode;
import org.rbtdesign.qvu.dto.ReportDesignSettings;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.SystemSettings;
import org.rbtdesign.qvu.dto.Table;
import org.rbtdesign.qvu.dto.TableColumnNames;
import org.rbtdesign.qvu.dto.TableSettings;
import org.rbtdesign.qvu.services.ReportService;
import org.rbtdesign.qvu.util.AuthHelper;
import org.rbtdesign.qvu.util.Constants;
import org.rbtdesign.qvu.util.DBHelper;
import org.rbtdesign.qvu.util.FileHandler;
import org.rbtdesign.qvu.util.Helper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * The type Main controller.
 */
@RestController
@CrossOrigin(origins = "*")
public class MainController {
    private static final Logger LOG = LogManager.getLogger(MainController.class);

    @Autowired
    MainService service;

    @Autowired
    ReportService reportService;

    @Autowired
    private FileHandler fileHandler;

    @Autowired
    private ConfigurationHelper config;

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

    @GetMapping("api/v1/document/groups/load")
    public List<DocumentGroup> loadDocumentGroups() {
        LOG.debug("in loadDocumentGroups()");

        return service.loadDocumentGroups();
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

    @PostMapping("api/v1/document/group/save")
    public OperationResult saveDocumentGroup(@RequestBody DocumentGroup group) {
        LOG.debug("in saveDocumentGroup()");
        return service.saveDocumentGroup(group);
    }

    @DeleteMapping("api/v1/document/group/{groupName}")
    public OperationResult deleteDocumentGroup(@PathVariable String groupName) {
        LOG.debug("in deleteDocumentGroup(" + groupName + ")");
        return service.deleteDocumentGroup(groupName);
    }

    @GetMapping("api/v1/lang/{langkey}/load")
    public String loadLang(@PathVariable String langkey) {
        LOG.debug("in loadLang(" + langkey + ")");
        return service.loadLang(langkey);
    }

    @PostMapping("api/v1/repo/verify")
    public OperationResult verifyRepositoryFolder(@RequestBody String repositoryFolder) {
        LOG.debug("in verifyRepositoryFolder(" + repositoryFolder + ")");
        return service.verifyInitialRepositoryFolder(repositoryFolder);
    }

    @PostMapping("api/v1/repo/initialize")
    public OperationResult initializeRepository(@RequestBody String initialInfo) {
        LOG.debug("in initializeRepository()");
        return service.initializeRepository(initialInfo);
    }

    @GetMapping("api/v1/db/datasource/{datasourceName}/tables")
    public OperationResult<List<Table>> getDatasourceTables(@PathVariable String datasourceName) {
        LOG.debug("in getDatasourceTables(" + datasourceName + ")");
        return service.getDatasourceTables(datasourceName);
    }

    @GetMapping("api/v1/db/datasource/{datasourceName}/treeview")
    public OperationResult<QuerySelectNode> getDatasourceTreeViewData(@PathVariable String datasourceName) {
        LOG.debug("in getDatasourceTables(" + datasourceName + ")");
        return service.getDatasourceTreeViewData(datasourceName);
    }

    @GetMapping("api/v1/db/types/load")
    public String[] getDatabaseTypes() {
        LOG.debug("in getDatabaseTypes()");
        return DBHelper.DATABASE_TYPES;
    }

    @PostMapping("api/v1/db/datasource/tablesettings")
    public OperationResult<List<TableSettings>> getTableSettings(@RequestBody DataSourceConfiguration datasource) {
        LOG.debug("in getTableSettings()");
        return service.getTableSettings(datasource);
    }

    @PostMapping("api/v1/db/datasource/{tableName}/columnsettings")
    public OperationResult<List<ColumnSettings>> getColumnSettings(@RequestBody DataSourceConfiguration datasource, @PathVariable String tableName) {
        LOG.debug("in getColumnSettings()");
        return service.getColumnSettings(datasource, tableName);
    }

    @PostMapping("api/v1/db/datasource/{tableName}/fksettings")
    public OperationResult<List<ForeignKeySettings>> getForeignKeySettings(@RequestBody DataSourceConfiguration datasource, @PathVariable String tableName) {
        LOG.debug("in getForeignKeySettings()");
        return service.getForeignKeySettings(datasource, tableName);
    }

    @GetMapping("api/v1/db/datasource/{datasourceName}/tablenames")
    public OperationResult<List<TableColumnNames>> getDatasourceTableNames(@PathVariable String datasourceName) {
        LOG.debug("in getDatasourceTableNames(" + datasourceName + ")");
        return service.getDatasourceTableNames(datasourceName);
    }

    @PostMapping("api/v1/document/save")
    public OperationResult<DocumentWrapper> saveDocument(@RequestBody DocumentWrapper doc) {
        LOG.debug("in saveDocument()");
        return service.saveDocument(doc);
    }

    @DeleteMapping("api/v1/document/delete/{type}/{group}/{name}")
    public OperationResult deleteDocument(@PathVariable String type, @PathVariable String group, @PathVariable String name) {
        LOG.debug("in deleteDocument(" + type + ", " + group + ", " + name + ")");
        return service.deleteDocument(type, group, name);
    }

    @PostMapping("api/v1/query/design/run")
    public OperationResult<QueryResult> runQuery(@RequestBody QueryDocumentRunWrapper runWrapper) {
        LOG.debug("in runQuery()");
        return service.runQuery(runWrapper);
    }

    @PostMapping("api/v1/query/run/tabular")
    public OperationResult<QueryResult> runTablularQuery(@RequestBody QueryRunWrapper runWrapper) {
        LOG.debug("in runQuery()");
        OperationResult<QueryResult> retval = service.runQuery(runWrapper);

        // for api call populate text in message
        if (!retval.isSuccess()) {
            List<String> replaceList = new ArrayList<>();
            replaceList.add(runWrapper.getGroupName());
            replaceList.add(runWrapper.getDocumentName());
            retval.setMessage(Helper.replaceTokens(config.getLanguageText(Constants.DEFAULT_LANGUAGE_KEY, retval.getMessage()), replaceList));
        }

        return retval;
    }

    @PostMapping("api/v1/query/run/json")
    public OperationResult<List<Map<String, Object>>> runJsonQuery(@RequestBody QueryRunWrapper runWrapper) {
        LOG.debug("in runJsonQuery()");
        OperationResult<List<Map<String, Object>>> retval = service.runJsonQuery(runWrapper);

        // for api call populate text in message
        if (!retval.isSuccess()) {
            List<String> replaceList = new ArrayList<>();
            replaceList.add(runWrapper.getGroupName());
            replaceList.add(runWrapper.getDocumentName());
            retval.setMessage(Helper.replaceTokens(config.getLanguageText(Constants.DEFAULT_LANGUAGE_KEY, retval.getMessage()), replaceList));
        }

        return retval;
    }

    @PostMapping("api/v1/query/run/json/objectgraph")
    public OperationResult<List<Map<String, Object>>> runJsonObjectGraphQuery(@RequestBody QueryRunWrapper runWrapper) {
        LOG.debug("in runJsonObjectQuery()");

        OperationResult<List<Map<String, Object>>> retval = service.runJsonObjectGraphQuery(runWrapper);

        // for api call populate text in message
        if (!retval.isSuccess()) {
            List<String> replaceList = new ArrayList<>();
            replaceList.add(runWrapper.getGroupName());
            replaceList.add(runWrapper.getDocumentName());
            retval.setMessage(Helper.replaceTokens(config.getLanguageText(Constants.DEFAULT_LANGUAGE_KEY, retval.getMessage()), replaceList));
        }

        return retval;

    }

    @PostMapping("api/v1/query/excel/export")
    public HttpEntity<byte[]> exportToExcel(@RequestBody ExcelExportWrapper wrapper) {
        LOG.debug("in exportToExcel()");
        byte[] excelContent = service.exportToExcel(wrapper);
        HttpHeaders header = new HttpHeaders();
        header.setContentType(new MediaType("application", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_file.xls");
        header.setContentLength(excelContent.length);
        return new HttpEntity<>(excelContent, header);
    }

    @GetMapping("api/v1/documents/currentuser/{documentType}")
    public OperationResult<DocumentNode> getAvailableDocuments(@PathVariable String documentType) {
        LOG.debug("in getAvailableDocuments(" + documentType + ")");
        return service.getAvailableDocuments(documentType);
    }

    @GetMapping("api/v1/document/{type}/{group}/{name}")
    public OperationResult getDocument(@PathVariable String type, @PathVariable String group, @PathVariable String name) {
        LOG.debug("in getDocument(" + type + ", " + group + ", " + name + ")");
        return service.getDocument(type, group, name);
    }

    @GetMapping("api/v1/system/settings/load")
    public OperationResult<SystemSettings> getSystemSettings() {
        LOG.debug("in getSystemSettings()");
        return service.getSystemSettings();
    }

    @PostMapping("api/v1/system/settings/save")
    public OperationResult saveSystemSettings(@RequestBody SystemSettings systemSettings) {
        LOG.debug("in saveAuthConfig()");
        return service.saveSystemSettings(systemSettings);
    }

    @GetMapping("api/v1/help/{lang}")
    public HttpEntity<byte[]> getHelpDocument(@PathVariable String lang) {
        LOG.debug("in getHelpDocument()");
        HttpEntity<byte[]> retval = null;
        try {
            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.APPLICATION_PDF);
            header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=qvu-help.pdf");
            byte[] data = fileHandler.getHelpDocument(lang);
            header.setContentLength(data.length);
            retval = new HttpEntity<>(data, header);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    @GetMapping("api/v1/gettingstarted/{lang}")
    public HttpEntity<byte[]> getGettingStartedDocument(@PathVariable String lang) {
        LOG.debug("in getGettingStartedDocument()");
        HttpEntity<byte[]> retval = null;
        try {
            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.APPLICATION_PDF);
            header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=qvu-gettingstarted.pdf");
            byte[] data = fileHandler.getGettingStartedDocument(lang);
            header.setContentLength(data.length);
            retval = new HttpEntity<>(data, header);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    @GetMapping("api/v1/admin/util/backup")
    public OperationResult<String> doBackup() {
        LOG.debug("in doBackup()");
        return service.doBackup();
    }

    @GetMapping("api/v1/admin/document/schedules")
    public OperationResult<DocumentSchedulesConfiguration> getDocumentSchedules() {
        LOG.debug("in getDocumentSchedules()");
        return service.getDocumentSchedules();
    }

    @PostMapping("api/v1/admin/document/schedules/save")
    public OperationResult saveDocumentSchedules(@RequestBody DocumentSchedulesConfiguration schedules) {
        LOG.debug("in saveDocumentSchedules()");
        return service.saveDocumentSchedules(schedules);
    }

    @PostMapping("api/v1/admin/user/up")
    public OperationResult updatePassword(@RequestBody String pass) {
        LOG.debug("in updatePassword()");
        return service.updateUserPassword(pass);
    }

    @RequestMapping(value="/login", method = RequestMethod.GET)
    public ResponseEntity login() {
        Map<String, String> headers = new HashMap<>();
        if (Constants.BASIC_SECURITY_TYPE.equals(config.getSecurityType())) {
            headers.put(HttpHeaders.WWW_AUTHENTICATE, "Basic realm=qvu");
        } 
        
        return new ResponseEntity<>(headers, HttpStatus.UNAUTHORIZED);
    }

    @RequestMapping(value="/api/v1/report/settings", method = RequestMethod.GET)
    public OperationResult<ReportDesignSettings> getReportDesignSettings() {
        LOG.debug("in getReportDesignSettings()");
        return service.getReportDesignSettings();
    }
    
    @GetMapping("api/v1/report/generate/{user}/{group}/{name}")
    public HttpEntity<byte[]> generateReport(@PathVariable String user, @PathVariable String group, @PathVariable String name) {
        LOG.debug("in generateReport(" + user + ", " + group + ", " + name + ")");
        HttpEntity<byte[]> retval = null;
        try {
            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.APPLICATION_PDF);
            header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=qvu-gettingstarted.pdf");
            
            OperationResult<byte[]> res  = reportService.generateReport(user, group, name);

            if (res.isSuccess()) {
                header.setContentLength(res.getResult().length);
                retval = new HttpEntity<>(res.getResult(), header);
            } else {
                retval = ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(res.getMessage().getBytes());
            }
        } catch (Exception ex) {
                retval = ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ex.toString().getBytes());
        }

        return retval;
    }

    @PostMapping("api/v1/report/generate")
    public HttpEntity<byte[]> generateReport(@RequestBody ReportDocument report) {
        LOG.debug("in generateReport()");
        HttpEntity<byte[]> retval = null;
        try {
            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.APPLICATION_PDF);
            header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=qvu-gettingstarted.pdf");
            OperationResult<byte[]> res = reportService.generateReport(report);
            if (res.isSuccess()) {
                header.setContentLength(res.getResult().length);
                retval = new HttpEntity<>(res.getResult(), header);
            } else {
                retval = ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(res.getMessage().getBytes());
            }
        } catch (Exception ex) {
                retval = ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ex.toString().getBytes());
        }

        return retval;
    }
}
