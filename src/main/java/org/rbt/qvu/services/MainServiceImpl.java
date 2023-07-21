package org.rbt.qvu.services;

import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.util.FileHandler;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import org.rbt.qvu.client.utils.SecurityService;
import org.rbt.qvu.dto.Column;
import org.rbt.qvu.dto.ColumnSettings;
import org.rbt.qvu.dto.DocumentGroup;
import org.rbt.qvu.dto.ForeignKey;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.QueryDocument;
import org.rbt.qvu.dto.QuerySelectNode;
import org.rbt.qvu.dto.ReportDocument;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableColumnNames;
import org.rbt.qvu.dto.TableSettings;
import org.rbt.qvu.util.CacheHelper;
import org.rbt.qvu.util.DBHelper;
import org.rbt.qvu.util.DatasourceSettingsHelper;
import org.rbt.qvu.util.Errors;
import org.rbt.qvu.util.Helper;
import org.rbt.qvu.util.QuerySelectTreeBuilder;
import org.rbt.qvu.util.RoleComparator;
import org.springframework.security.saml2.provider.service.authentication.DefaultSaml2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class MainServiceImpl implements MainService {
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    private DataSources qvuds;

    @Autowired
    private Config config;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private FileHandler fileHandler;

    private DatasourceSettingsHelper datasourceSettingsHelper = new DatasourceSettingsHelper();

    private CacheHelper cacheHelper = new CacheHelper();

    @PostConstruct
    private void init() {
        LOG.info("in MainServiceImpl.init()");
        datasourceSettingsHelper.load(config.getDatasourcesConfig());
    }

    @Override
    public AuthData loadAuthData() throws Exception {
        AuthData retval = new AuthData();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (LOG.isDebugEnabled()) {
            LOG.debug("local=" + request.getLocale().toLanguageTag());
            LOG.debug("authetication=" + auth);
        }
        if ((auth != null) && StringUtils.isNotEmpty(auth.getName())) {
            retval.setCurrentUser(getCurrentUser());
            boolean localUser = isLocalUser();
            retval.setAllowUserAdd(localUser);
            retval.setAllowUserDelete(localUser);
            
            SecurityConfiguration scfg = config.getSecurityConfig();
            retval.setInitialSetupRequired(config.isInitialSetupRequired());
            SecurityService authService = config.getSecurityConfig().getAuthenticatorService();

            // users and roles are defined via json
            if (authService != null) { // if we have a service defined we will try to loaf from there
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
            } else {
                retval.getAllRoles().addAll(scfg.getRoles());
                retval.setAllUsers(scfg.getUsers());
            }

            Collections.sort(retval.getAllRoles(), new RoleComparator());

            String alias = config.getSecurityConfig().getRoleAlias(Constants.DEFAULT_ADMINISTRATOR_ROLE);
            if (StringUtils.isNotEmpty(alias)) {
                retval.setAdministratorRole(alias);
            } else {
                retval.setAdministratorRole(Constants.DEFAULT_ADMINISTRATOR_ROLE);
            }

            alias = config.getSecurityConfig().getRoleAlias(Constants.DEFAULT_QUERY_DESIGNER_ROLE);
            if (StringUtils.isNotEmpty(alias)) {
                retval.setQueryDesignerRole(alias);
            } else {
                retval.setQueryDesignerRole(Constants.DEFAULT_QUERY_DESIGNER_ROLE);
            }

            alias = config.getSecurityConfig().getRoleAlias(Constants.DEFAULT_REPORT_DESIGNER_ROLE);
            if (StringUtils.isNotEmpty(alias)) {
                retval.setReportDesignerRole(alias);
            } else {
                retval.setReportDesignerRole(Constants.DEFAULT_REPORT_DESIGNER_ROLE);
            }

            alias = config.getSecurityConfig().getRoleAlias(Constants.DEFAULT_USER_ROLE);
            if (StringUtils.isNotEmpty(alias)) {
                retval.setUserRole(alias);
            } else {
                retval.setUserRole(Constants.DEFAULT_USER_ROLE);
            }

            if (LOG.isDebugEnabled()) {
                LOG.debug("AuthData: " + fileHandler.getGson().toJson(retval, AuthData.class));
            }
        }

        return retval;
    }

    @Override
    public List<DataSourceConfiguration> loadDatasources() {
        return fileHandler.loadDatasources();
    }

    @Override
    public List<DocumentGroup> loadDocumentGroups() {
        return fileHandler.loadDocumentGroups();
    }

    @Override
    public OperationResult saveDatasource(DataSourceConfiguration datasource) {
        OperationResult<List<DataSourceConfiguration>> retval = new OperationResult();

        try {
            retval = fileHandler.saveDatasource(datasource);

            if (retval.isSuccess()) {
                cacheHelper.getTableCache().clear();
                cacheHelper.clearDatasource(datasource.getDatasourceName());
                config.getDatasourcesConfig().setDatasources(retval.getResult());
                datasourceSettingsHelper.load(config.getDatasourcesConfig());
            }
        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        }
        return retval;
    }

    @Override
    public OperationResult testDatasource(DataSourceConfiguration datasource) {
        OperationResult retval = new OperationResult();

        Connection conn = null;
        ResultSet res = null;
        try {
            conn = DBHelper.getConnection(datasource);
            DatabaseMetaData dmd = conn.getMetaData();
            res = dmd.getSchemas();
        } catch (Exception ex) {
            retval.setErrorCode(Errors.DB_CONNECTION_FAILED);
            retval.setMessage(config.getLanguageText(request.getLocale().toLanguageTag(),
                    Errors.getMessage(Errors.DB_CONNECTION_FAILED),
                    new String[]{datasource.getDatasourceName(), ex.toString()}));
        } finally {
            DBHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    @Override
    public OperationResult deleteDatasource(String datasourceName) {
        return fileHandler.deleteDatasource(datasourceName);
    }

    @Override
    public OperationResult saveRole(Role role) {
        OperationResult retval = new OperationResult();
        if (config.getSecurityConfig().isAllowServiceSave()) {
            try {
                role.setNewRecord(false);
                retval = config.getSecurityConfig().getAuthenticatorService().saveRole(role);
            } catch (Exception ex) {
                Helper.populateResultError(retval, ex);
            }
        } else {
            retval = fileHandler.saveRole(role);
        }

        return retval;
    }

    @Override
    public OperationResult deleteRole(String roleName) {
        OperationResult retval = new OperationResult();
        if (config.getSecurityConfig().isAllowServiceSave()) {
            try {
                retval = config.getSecurityConfig().getAuthenticatorService().deleteRole(roleName);
            } catch (Exception ex) {
                Helper.populateResultError(retval, ex);
            }
        } else {
            retval = fileHandler.deleteRole(roleName);
        }

        return retval;
    }

    @Override
    public OperationResult saveDocumentGroup(DocumentGroup group) {
        OperationResult retval = new OperationResult();
        try {
            group.setNewRecord(false);
            retval = fileHandler.saveDocumentGroup(group);
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }
        return retval;
    }

    @Override
    public OperationResult deleteDocumentGroup(String groupName) {
        OperationResult retval = new OperationResult();
        try {
            retval = fileHandler.deleteDocumentGroup(groupName);
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    @Override
    public OperationResult saveUser(User user) {
        OperationResult retval = new OperationResult();
        if (config.getSecurityConfig().isAllowServiceSave()) {
            try {
                user.setNewRecord(false);
                retval = config.getSecurityConfig().getAuthenticatorService().saveUser(user);
            } catch (Exception ex) {
                Helper.populateResultError(retval, ex);
            }
        } else {
            retval = fileHandler.saveUser(user);
        }

        return retval;
    }

    @Override
    public OperationResult deleteUser(String userId) {
        OperationResult retval = new OperationResult();
        if (config.getSecurityConfig().isAllowServiceSave()) {
            try {
                retval = config.getSecurityConfig().getAuthenticatorService().deleteUser(userId);
            } catch (Exception ex) {
                Helper.populateResultError(retval, ex);
            }
        } else {
            retval = fileHandler.deleteUser(userId);
        }

        return retval;
    }

    @Override
    public String loadLang(String langkey) {
        String retval = "";
        Map<String, String> langMap = config.getLangResources().get(langkey);
        if (langMap == null) {
            retval = fileHandler.getGson(true).toJson(config.getLangResources().get(Constants.DEFAULT_LANGUAGE_KEY));
        } else {
            retval = fileHandler.getGson(true).toJson(langMap);
        }

        LOG.debug("Language File: " + retval);

        return retval;
    }

    @Override
    public OperationResult doInitialSetup(InitialSetup initialSetup) {
        OperationResult retval = new OperationResult();
        try {
            File f = new File(initialSetup.getRepository() + File.separator + "config");

            f.mkdirs();

            config.setRepositoryFolder(initialSetup.getRepository());
            config.setSecurityType(initialSetup.getSecurityType());
            SecurityConfiguration securityConfig = new SecurityConfiguration();
            securityConfig.setSecurityType(initialSetup.getSecurityType());
            securityConfig.setAllowServiceSave(initialSetup.isAllowServiceSave());
            securityConfig.setAuthenticatorServiceClassName(initialSetup.getSecurityServiceClass());
            switch (initialSetup.getSecurityType()) {
                case Constants.SAML_SECURITY_TYPE ->
                    securityConfig.setSamlConfiguration(initialSetup.getSamlConfiguration());
                case Constants.OIDC_SECURITY_TYPE ->
                    securityConfig.setOidcConfiguration(initialSetup.getOidcConfiguration());
            }

            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-language.json"), new File(config.getLanguageFileName()));
            fileHandler.saveSecurityConfig(securityConfig);

            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-datasource-configuration.json"), new File(config.getDatasourceConfigurationFileName()));
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    @Override
    public OperationResult verifyInitialRepositoryFolder(String folder) {
        OperationResult retval = new OperationResult();

        if (StringUtils.isNotEmpty(folder)) {
            File f = new File(folder);
            if (f.exists() && f.isDirectory()) {
                File cfg = new File(f.getPath() + File.separator + "config");
                if (cfg.exists()) {
                    retval.setErrorCode(Errors.FOLDER_IS_NOT_EMPTY);
                    retval.setMessage(Errors.getMessage(Errors.FOLDER_IS_NOT_EMPTY));
                }
            } else {
                retval.setErrorCode(Errors.FOLDER_NOT_FOUND);
                retval.setMessage(Errors.getMessage(Errors.FOLDER_NOT_FOUND));
            }
        }

        return retval;
    }

    @Override
    public OperationResult<QuerySelectNode> getDatasourceTreeViewData(String datasourceName) {
        OperationResult<QuerySelectNode> retval = new OperationResult<>();

        long start = System.currentTimeMillis();
        OperationResult<List<Table>> res = getDatasourceTables(datasourceName);

        if (res.isSuccess()) {
            retval = buildQuerySelectTreeView(datasourceName, res.getResult());
        } else {
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
        }

        LOG.debug("getDatasourceTreeViewData() - elapsed time: " + ((System.currentTimeMillis() - start) / 1000) + "sec");
        return retval;
    }

    private OperationResult<QuerySelectNode> buildQuerySelectTreeView(String datasourceName, List<Table> tableInfo) {
        OperationResult<QuerySelectNode> retval = new OperationResult();

        try {
            User user = getCurrentUser();
            if (LOG.isDebugEnabled()) {
                LOG.debug("user: " + user.getName());
                for (String s : user.getRoles()) {
                    LOG.debug("\trole: " + s);
                }
            }

            Set<String> userRoles = new HashSet<>(user.getRoles());

            QuerySelectNode node = QuerySelectTreeBuilder.build(datasourceSettingsHelper,
                    config.getDatasourcesConfig().getDatasourceConfiguration(datasourceName),
                    userRoles,
                    config.getDatasourcesConfig().getMaxImportedKeyDepth(),
                    config.getDatasourcesConfig().getMaxExportedKeyDepth(),
                    tableInfo);

            retval.setResult(node);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            retval.setErrorCode(OperationResult.UNEXPECTED_EXCEPTION);
            retval.setMessage(ex.toString());
        }

        return retval;
    }

    @Override
    public OperationResult<List<Table>> getDatasourceTables(String datasourceName) {
        OperationResult<List<Table>> retval = new OperationResult();
        List<Table> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;
        try {
            long start = System.currentTimeMillis();

            DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(datasourceName);

            if (ds != null) {

                // load up custom foreign keys to apply tp table definitions
                Map<String, List<ForeignKey>> customForeignKeys = new HashMap<>();
                for (ForeignKey fk : ds.getCustomForeignKeys()) {
                    List<ForeignKey> fklist = customForeignKeys.get(fk.getTableName());
                    if (fklist == null) {
                        fklist = new ArrayList<>();
                        customForeignKeys.put(fk.getTableName(), fklist);
                    }
                    fklist.add(fk);
                }

                conn = qvuds.getConnection(datasourceName);
                DatabaseMetaData dmd = conn.getMetaData();

                res = dmd.getTables(null, ds.getSchema(), "%", DBHelper.TABLE_TYPES);

                while (res.next()) {
                    String schema = res.getString(2);
                    String tname = res.getString(3);
                    String key = ds.getDatasourceName() + "." + tname;

                    Table t = cacheHelper.getTableCache().get(key);

                    if (t == null) {
                        t = new Table();
                        t.setSchema(schema);
                        t.setName(tname);
                        t.setDatasource(datasourceName);
                        t.setType(res.getString(4));
                        t.setColumns(getTableColumns(datasourceName, dmd, t));
                        t.setColumns(getTableColumns(datasourceName, dmd, t));
                        t.setImportedKeys(getImportedKeys(datasourceName, dmd, t));
                        t.setExportedKeys(getExportedKeys(datasourceName, dmd, t));

                        // add any applicable custom foreign keys to current table
                        List<ForeignKey> fklist = customForeignKeys.get(t.getName());
                        if (fklist != null) {
                            for (ForeignKey fk : fklist) {
                                if (fk.isImported()) {
                                    t.getImportedKeys().add(fk);
                                } else {
                                    t.getExportedKeys().add(fk);
                                }
                            }
                        }

                        setIndexColumns(dmd, t);
                        setPrimaryKeys(dmd, t);
                        cacheHelper.getTableCache().put(key, t);
                    }

                    data.add(t);
                }

                retval.setResult(data);

                LOG.debug("getDatasourceTables(" + datasourceName + ") - elapsed time: " + ((System.currentTimeMillis() - start) / 1000) + "sec");
            } else {
                throw new Exception("Datasource " + datasourceName + " not found");
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            retval.setErrorCode(OperationResult.UNEXPECTED_EXCEPTION);
            retval.setMessage(ex.toString());
        } finally {
            DBHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    private void setIndexColumns(DatabaseMetaData dmd, Table t) throws Exception {
        ResultSet res = null;
        Map<String, Column> cmap = new HashMap<>();
        for (Column c : t.getColumns()) {
            cmap.put(c.getName().toLowerCase(), c);
        }
        res = dmd.getPrimaryKeys(null, t.getSchema(), t.getName());

        try {
            res = dmd.getIndexInfo(null, t.getSchema(), t.getName(), false, true);

            while (res.next()) {
                String cname = res.getString(9);
                if (StringUtils.isNotEmpty(cname)) {
                    Column c = cmap.get(cname.toLowerCase());

                    if (c != null) {
                        c.setIndexed(true);
                    }
                }
            }
        } finally {
            DBHelper.closeConnection(null, null, res);
        }
    }

    private void setPrimaryKeys(DatabaseMetaData dmd, Table t) throws Exception {
        ResultSet res = null;

        try {
            Map<String, Column> cmap = new HashMap<>();
            for (Column c : t.getColumns()) {
                cmap.put(c.getName().toLowerCase(), c);
            }
            res = dmd.getPrimaryKeys(null, t.getSchema(), t.getName());

            while (res.next()) {
                if (StringUtils.isEmpty(t.getPkName())) {
                    t.setPkName(res.getString(6));
                }

                String cname = res.getString(4).toLowerCase();
                int indx = res.getInt(5);

                Column c = cmap.get(cname);

                if (c != null) {
                    c.setPkIndex(indx);
                }
            }
        } finally {
            DBHelper.closeConnection(null, null, res);
        }
    }

    private List<ForeignKey> getImportedKeys(String datasourceName, DatabaseMetaData dmd, Table t) throws Exception {
        List<ForeignKey> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getImportedKeys(null, t.getSchema(), t.getName());

            Map<String, ForeignKey> fkMap = new HashMap<>();
            while (res.next()) {
                String toTable = res.getString(3);
                String toColumn = res.getString(4);
                String fromColumn = res.getString(8);
                String fkName = res.getString(12);
                ForeignKey fk = fkMap.get(fkName);

                if (fk == null) {
                    fk = new ForeignKey();
                    fk.setDatasourceName(datasourceName);
                    fk.setToTableName(toTable);
                    fk.setName(fkName);
                    fk.setTableName(t.getName());
                    fk.setImported(true);
                    retval.add(fk);
                    fkMap.put(fkName, fk);
                }

                fk.getColumns().add(fromColumn);
                fk.getToColumns().add(toColumn);
            }
        } finally {
            DBHelper.closeConnection(null, null, res);
        }

        return retval;
    }

    private List<ForeignKey> getExportedKeys(String datasourceName, DatabaseMetaData dmd, Table t) throws Exception {
        List<ForeignKey> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getExportedKeys(null, t.getSchema(), t.getName());

            Map<String, ForeignKey> fkMap = new HashMap<>();
            while (res.next()) {
                String toColumn = res.getString(8);
                String toTable = res.getString(7);
                String fromColumn = res.getString(4);
                String fkName = res.getString(12);
                ForeignKey fk = fkMap.get(fkName);

                if (fk == null) {
                    fk = new ForeignKey();
                    fk.setDatasourceName(datasourceName);
                    fk.setToTableName(toTable);
                    fk.setName(fkName);
                    fk.setTableName(t.getName());
                    retval.add(fk);
                    fkMap.put(fkName, fk);
                }

                fk.getColumns().add(fromColumn);
                fk.getToColumns().add(toColumn);
            }
        } finally {
            DBHelper.closeConnection(null, null, res);
        }

        return retval;
    }

    private List<Column> getTableColumns(String datasourceName, DatabaseMetaData dmd, Table t) throws Exception {
        List<Column> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getColumns(null, t.getSchema(), t.getName(), "%");

            while (res.next()) {
                Column c = new Column();
                c.setSchema(res.getString(2));
                c.setDatasource(datasourceName);
                c.setTable(t.getName());
                c.setName(res.getString(4));
                c.setDataType(res.getInt(5));
                c.setTypeName(res.getString(6));
                c.setColumnSize(res.getInt(7));
                c.setDecimalDigits(res.getInt(9));
                c.setNullable(res.getInt(11) == DatabaseMetaData.columnNullable);
                c.setDefaultValue(res.getString(13));

                retval.add(c);
            }

        } finally {
            DBHelper.closeConnection(null, null, res);
        }

        return retval;
    }
    
    private boolean isLocalUser() {
       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       return (auth.getPrincipal() instanceof User);
    }

    private User getCurrentUser() {
        User retval = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null) {
            Object o = auth.getPrincipal();
            if (o != null) {
                if (o instanceof User) {
                    retval = (User) o;
                } else if (o instanceof DefaultSaml2AuthenticatedPrincipal) {
                    retval = toUser((DefaultSaml2AuthenticatedPrincipal) o);
                } else if (o instanceof DefaultOAuth2User) {
                    retval = toUser((DefaultOAuth2User) o);
                }
            }
        }

        return retval;
    }

    private SecurityConfiguration getSecurityConfig() {
        return config.getSecurityConfig();
    }
    
    private User toUser(DefaultSaml2AuthenticatedPrincipal u) {
        User retval = getSecurityConfig().findUser(u.getName());
        
        if (retval == null) {
            retval = new User();
            retval.setUserId(u.getName());
            fileHandler.saveUser(retval);
        }

        return retval;
    }

    private User toUser(DefaultOAuth2User u) {
        User retval = getSecurityConfig().findUser(u.getAttribute(StandardClaimNames.PREFERRED_USERNAME));
        
        if (retval == null) {
            retval = new User();
            retval.setUserId(u.getAttribute(StandardClaimNames.PREFERRED_USERNAME));
            fileHandler.saveUser(retval);
        }

        return retval;
    }

    @Override
    public OperationResult<List<TableColumnNames>> getDatasourceTableNames(String datasourceName) {
        OperationResult<List<TableColumnNames>> retval = new OperationResult();
        List<TableColumnNames> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;

        try {
            DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(datasourceName);
            if (ds != null) {
                conn = qvuds.getConnection(datasourceName);

                if (conn == null) {
                    conn = DBHelper.getConnection(ds);
                }

                DatabaseMetaData dmd = conn.getMetaData();

                res = dmd.getTables(null, ds.getSchema(), "%", DBHelper.TABLE_TYPES);

                while (res.next()) {
                    TableColumnNames t = new TableColumnNames();
                    t.setTableName(res.getString(3));
                    t.setColumnNames(getColumnNames(dmd, ds.getSchema(), t.getTableName()));
                    data.add(t);
                }

                retval.setResult(data);
            }
        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        } finally {
            DBHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    @Override
    public OperationResult<List<TableSettings>> getTableSettings(DataSourceConfiguration ds) {
        OperationResult<List<TableSettings>> retval = new OperationResult();
        List<TableSettings> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;

        try {
            conn = qvuds.getConnection(ds.getDatasourceName());

            if (conn == null) {
                conn = DBHelper.getConnection(ds);
            }

            Map<String, TableSettings> tamap = new HashMap();

            if (ds.getDatasourceTableSettings() != null) {
                for (TableSettings ta : ds.getDatasourceTableSettings()) {
                    tamap.put(ta.getTableName(), ta);
                }
            }

            DatabaseMetaData dmd = conn.getMetaData();

            res = dmd.getTables(null, ds.getSchema(), "%", DBHelper.TABLE_TYPES);

            while (res.next()) {
                String tname = res.getString(3);

                TableSettings curta = tamap.get(tname);

                if (curta == null) {
                    TableSettings tanew = new TableSettings();
                    tanew.setDatasourceName(ds.getDatasourceName());
                    tanew.setTableName(tname);
                    data.add(tanew);
                } else {
                    data.add(curta);
                }
            }

            Collections.sort(data);
            retval.setResult(data);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        } finally {
            DBHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    private List<String> getColumnNames(DatabaseMetaData dmd, String schema, String table) throws Exception {
        List<String> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getColumns(null, schema, table, "%");

            while (res.next()) {
                retval.add(res.getString(4));
            }
        } finally {
            DBHelper.closeConnection(null, null, res);
        }

        return retval;
    }

    @Override
    public OperationResult<List<ColumnSettings>> getColumnSettings(DataSourceConfiguration ds, String tableName) {
        OperationResult<List<ColumnSettings>> retval = new OperationResult<>();
        List<ColumnSettings> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;

        try {
            conn = qvuds.getConnection(ds.getDatasourceName());

            if (conn == null) {
                conn = DBHelper.getConnection(ds);
            }

            TableSettings tset = null;
            if (ds.getDatasourceTableSettings() != null) {
                for (TableSettings t : ds.getDatasourceTableSettings()) {
                    if (t.getTableName().equals(tableName)) {
                        tset = t;
                        break;
                    }
                }
            }

            Map<String, ColumnSettings> cmap = new HashMap();

            if (tset != null) {
                for (ColumnSettings cset : tset.getTableColumnSettings()) {
                    cmap.put(cset.getColumnName(), cset);
                }
            }

            DatabaseMetaData dmd = conn.getMetaData();

            res = dmd.getColumns(null, ds.getSchema(), tableName, "%");

            while (res.next()) {
                String cname = res.getString(4);

                ColumnSettings curc = cmap.get(cname);
                if (curc == null) {
                    ColumnSettings cnew = new ColumnSettings();
                    cnew.setDatasourceName(ds.getDatasourceName());
                    cnew.setTableName(tableName);
                    cnew.setColumnName(cname);
                    data.add(cnew);
                } else {
                    data.add(curc);
                }
            }

            Collections.sort(data);
            retval.setResult(data);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        } finally {
            DBHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    public OperationResult getDocument(String type, String group, String name) {
        return fileHandler.getDocument(type, group, name);
    }

    @Override
    public OperationResult<QueryDocument> saveQueryDocument(@RequestBody QueryDocument doc) {
        OperationResult retval = new OperationResult();
        try {
            User curuser = getCurrentUser();

            if (doc.getCreateDate() == null) {
                doc.setCreateDate(new Timestamp(System.currentTimeMillis()));
                doc.setCreatedBy(curuser.getName());
            } else {
                doc.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                doc.setUpdatedBy(curuser.getName());
            }

            retval = fileHandler.saveQueryDocument(doc);
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;

    }

    @Override
    public OperationResult<ReportDocument> saveReportDocument(@RequestBody ReportDocument doc) {
        OperationResult retval = new OperationResult();
        try {
            User curuser = getCurrentUser();

            if (doc.getCreateDate() == null) {
                doc.setCreateDate(new Timestamp(System.currentTimeMillis()));
                doc.setCreatedBy(curuser.getName());
            } else {
                doc.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                doc.setUpdatedBy(curuser.getName());
            }

            retval = fileHandler.saveReportDocument(doc);
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;

    }

    @Override
    public OperationResult deleteDocument(String type, String group, String name) {
        return fileHandler.deleteDocument(type, group, name);
    }

}
