package org.rbt.qvu.services;

import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
import org.rbt.qvu.dto.DocumentNode;
import org.rbt.qvu.dto.DocumentWrapper;
import org.rbt.qvu.dto.ExcelExportWrapper;
import org.rbt.qvu.dto.ForeignKey;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.QueryDocument;
import org.rbt.qvu.dto.QueryParameter;
import org.rbt.qvu.dto.QueryResult;
import org.rbt.qvu.dto.QueryDocumentRunWrapper;
import org.rbt.qvu.dto.QueryRunWrapper;
import org.rbt.qvu.dto.QuerySelectNode;
import org.rbt.qvu.dto.ReportDocument;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableColumnNames;
import org.rbt.qvu.dto.TableSettings;
import org.rbt.qvu.util.CacheHelper;
import org.rbt.qvu.util.DBHelper;
import org.rbt.qvu.util.DatasourceSettingsHelper;
import org.rbt.qvu.util.DocumentGroupComparator;
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

    @Autowired
    private DBHelper dbHelper;

    private final DatasourceSettingsHelper datasourceSettingsHelper = new DatasourceSettingsHelper();

    private final CacheHelper cacheHelper = new CacheHelper();

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
            conn = dbHelper.getConnection(datasource);
            DatabaseMetaData dmd = conn.getMetaData();
            res = dmd.getSchemas();
        } catch (Exception ex) {
            retval.setErrorCode(Errors.DB_CONNECTION_FAILED);
            retval.setMessage(config.getLanguageText(request.getLocale().toLanguageTag(),
                    Errors.getMessage(Errors.DB_CONNECTION_FAILED),
                    new String[]{datasource.getDatasourceName(), ex.toString()}));
        } finally {
            dbHelper.closeConnection(conn, null, res);
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
        String retval;
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
            dbHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    private void setIndexColumns(DatabaseMetaData dmd, Table t) throws Exception {
        ResultSet res;
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
            dbHelper.closeConnection(null, null, res);
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
            dbHelper.closeConnection(null, null, res);
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
            dbHelper.closeConnection(null, null, res);
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
            dbHelper.closeConnection(null, null, res);
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
            dbHelper.closeConnection(null, null, res);
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
                    conn = dbHelper.getConnection(ds);
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
            dbHelper.closeConnection(conn, null, res);
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
                conn = dbHelper.getConnection(ds);
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
            dbHelper.closeConnection(conn, null, res);
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
            dbHelper.closeConnection(null, null, res);
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
                conn = dbHelper.getConnection(ds);
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
            dbHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    @Override
    public OperationResult getDocument(String type, String group, String name) {
        return fileHandler.getDocument(type, group, name);
    }

    @Override
    public OperationResult<DocumentWrapper> saveDocument(@RequestBody DocumentWrapper docWrapper) {
        OperationResult<DocumentWrapper> retval = new OperationResult();
        try {
            if (docWrapper.getReportDocument() != null) {
                ReportDocument doc = docWrapper.getReportDocument();
                if (doc.getCreateDate() == null) {
                    doc.setCreateDate(docWrapper.getActionTimestamp());
                    doc.setCreatedBy(docWrapper.getUserId());
                } else {
                    doc.setLastUpdated(docWrapper.getActionTimestamp());
                    doc.setUpdatedBy(docWrapper.getUserId());
                }

                OperationResult<ReportDocument> opr = fileHandler.saveReportDocument(doc);

                docWrapper.setReportDocument(opr.getResult());
                retval.setErrorCode(opr.getErrorCode());
                retval.setMessage(opr.getMessage());
            } else if (docWrapper.getQueryDocument() != null) {
                QueryDocument doc = docWrapper.getQueryDocument();
                if (doc.getCreateDate() == null) {
                    doc.setCreateDate(docWrapper.getActionTimestamp());
                    doc.setCreatedBy(docWrapper.getUserId());
                } else {
                    doc.setLastUpdated(docWrapper.getActionTimestamp());
                    doc.setUpdatedBy(docWrapper.getUserId());
                }
                OperationResult<QueryDocument> opr = fileHandler.saveQueryDocument(doc);
                docWrapper.setQueryDocument(opr.getResult());
                retval.setErrorCode(opr.getErrorCode());
                retval.setMessage(opr.getMessage());
            }

            retval.setResult(docWrapper);
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    @Override
    public OperationResult deleteDocument(String type, String group, String name) {
        return fileHandler.deleteDocument(type, group, name);
    }

    private QueryResult getQueryResult(ResultSet res) throws SQLException {
        QueryResult retval = new QueryResult();

        ResultSetMetaData rmd = res.getMetaData();

        // rowcount 
        retval.getHeader().add("#");
        int[] cwidths = new int[rmd.getColumnCount()];
        retval.getColumnTypes().add(java.sql.Types.INTEGER);
        for (int i = 0; i < cwidths.length; ++i) {
            String nm = rmd.getColumnLabel(i + 1);
            if (StringUtils.isEmpty(nm)) {
                nm = rmd.getColumnName(i + 1);
            }
            retval.getHeader().add(nm);
            retval.getColumnTypes().add(rmd.getColumnType(i + 1));
        }

        int rowcnt = 0;
        retval.getInitialColumnWidths().add(Constants.DEFAULT_ROW_NUMBER_WIDTH);
        while (res.next()) {
            List<Object> row = new ArrayList<>();
            
            row.add(rowcnt + 1);

            rowcnt++;
            for (int i = 0; i < rmd.getColumnCount(); ++i) {
                Object o = res.getObject(i + 1);

                if (o != null) {
                    cwidths[i] = cwidths[i] + o.toString().length();
                }

                row.add(o);
            }
            retval.getData().add(row);
        }

        retval.setRowCount(rowcnt);
        if (rowcnt > 0) {
            for (Integer i = 0; i < cwidths.length; ++i) {
                Integer hdrlen = (retval.getHeader().get(i+1).length() + 4);

                int type = retval.getColumnTypes().get(i + 1);
                if (dbHelper.isDataTypeDateTime(type)) {
                    cwidths[i] = DBHelper.DEFAULT_DATETIME_DISPLAY_COLUMN_WIDTH;
                } else if (dbHelper.isDataTypeNumeric(type)) {
                    cwidths[i] = DBHelper.DEFAULT_NUMBER_DISPLAY_COLUMN_WIDTH;
                } else if (dbHelper.isDataTypeString(type)) {
                    int avg = cwidths[i] / rowcnt;
                    if (avg == 0) {
                        avg = hdrlen;
                    }
                    cwidths[i] = Math.min(avg, DBHelper.DEFAULT_MAX_DISPLAY_COLUMN_WIDTH);
                } else {
                    cwidths[i] = DBHelper.DEFAULT_DISPLAY_COLUMN_WIDTH;
                }

                if (hdrlen > cwidths[i]) {
                    cwidths[i] = hdrlen;
                }
                retval.getInitialColumnWidths().add(cwidths[i]);
            }
        } else {
            for (Integer i = 0; i < cwidths.length; ++i) {
                retval.getInitialColumnWidths().add(retval.getHeader().get(i+1).length() + 4);
            }
        }

        return retval;
    }

    @Override
    public OperationResult<QueryResult> runQuery(QueryRunWrapper runWrapper) {
        OperationResult<QueryDocument> res = fileHandler.getDocument(FileHandler.QUERY_FOLDER, runWrapper.getGroupName(), runWrapper.getDocumentName());

        if (res.isSuccess()) {
            QueryDocumentRunWrapper wrapper = new QueryDocumentRunWrapper();
            wrapper.setDocument(res.getResult());
            wrapper.setParameters(runWrapper.getParameters());
            return runQuery(wrapper);
        } else {
            OperationResult<QueryResult> retval = new OperationResult<>();
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
            return retval;
        }
    }

    @Override
    public OperationResult<QueryResult> runQuery(QueryDocumentRunWrapper runWrapper) {
        OperationResult<QueryResult> retval = new OperationResult<>();

        Connection conn = null;
        Statement stmt = null;
        ResultSet res = null;

        try {
            DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(runWrapper.getDocument().getDatasource());
            runWrapper.getDocument().setDatabaseType(ds.getDatabaseType());
            conn = qvuds.getConnection(runWrapper.getDocument().getDatasource());
            String sql = dbHelper.getSelect(runWrapper);

            if ((runWrapper.getParameters() != null) && !runWrapper.getParameters().isEmpty()) {
                PreparedStatement ps = conn.prepareStatement(sql);
                stmt = ps;
                for (int i = 0; i < runWrapper.getParameters().size(); ++i) {
                    QueryParameter p = runWrapper.getParameters().get(i);
                    if (dbHelper.isDataTypeString(p.getDataType())
                            || dbHelper.isDataTypeDateTime(p.getDataType())) {
                        ps.setString(i + 1, p.getValue());
                    } else if (dbHelper.isDataTypeNumeric(p.getDataType())) {
                    }
                }
                res = ps.executeQuery();
            } else {
                stmt = conn.createStatement();
                res = stmt.executeQuery(sql);
            }

            retval.setResult(getQueryResult(res));
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        } finally {
            dbHelper.closeConnection(conn, stmt, res);
        }

        return retval;
    }

    @Override
    public byte[] exportToExcel(ExcelExportWrapper wrapper) {
        byte[] retval = null;
        // Save
        ByteArrayOutputStream bos = null;
        try {

            XSSFWorkbook wb = new XSSFWorkbook();

            String name = wrapper.getName();
            if (StringUtils.isEmpty(name)) {
                name = "export-" + Constants.FILE_TS_FORMAT.format(new Date()) + ".xlsx";
            }

            XSSFSheet sheet = wb.createSheet(name);

            XSSFCellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            byte[] rgbB = Hex.decodeHex(wrapper.getHeaderBackgroundColor());
            XSSFColor color = new XSSFColor(rgbB, null);
            headerStyle.setFillForegroundColor(color);
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerFont.setBold(true);

            headerFont.setFontHeightInPoints((short) wrapper.getHeaderFontSize());
            rgbB = Hex.decodeHex(wrapper.getHeaderFontColor());
            headerFont.setColor( new XSSFColor(rgbB, null).getIndex());
            headerStyle.setFont(headerFont);
            
            XSSFCellStyle detailStyle1 = wb.createCellStyle();
            Font detailFont = wb.createFont();
            detailStyle1.setBorderLeft(BorderStyle.THIN);
            detailStyle1.setBorderTop(BorderStyle.THIN);
            detailStyle1.setBorderRight(BorderStyle.THIN);
            detailStyle1.setBorderBottom(BorderStyle.THIN);
            
            rgbB = Hex.decodeHex(wrapper.getDetailBackgroundColor1());
            color = new XSSFColor(rgbB, null);
            detailStyle1.setFillForegroundColor(color);
            detailStyle1.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            detailFont.setFontHeightInPoints((short) wrapper.getDetailFontSize());
            rgbB = Hex.decodeHex(wrapper.getDetailFontColor());
            detailFont.setColor( new XSSFColor(rgbB, null).getIndex());
            detailFont.setFontHeightInPoints((short) wrapper.getDetailFontSize());

            detailStyle1.setFont(detailFont);


            XSSFCellStyle detailStyle2 = wb.createCellStyle();
            detailStyle2.setBorderLeft(BorderStyle.THIN);
            detailStyle2.setBorderTop(BorderStyle.THIN);
            detailStyle2.setBorderRight(BorderStyle.THIN);
            detailStyle2.setBorderBottom(BorderStyle.THIN);
            
            rgbB = Hex.decodeHex(wrapper.getDetailBackgroundColor2());
            color = new XSSFColor(rgbB, null);
            detailStyle2.setFillForegroundColor(color);
            detailStyle2.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            detailStyle2.setFont(detailFont);

            XSSFRow row;
            XSSFCell cell;
            int rownum = 0;
            row = sheet.createRow(rownum++);
            List<String> header = wrapper.getQueryResults().getHeader();
            for (int i = 1; i < header.size(); ++i) {
                // Create cell - skip first data entry - this results is row num
                cell = row.createCell(i-1);
                cell.setCellValue(header.get(i));
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i-1, 25 * Constants.DEFAULT_PIXELS_PER_CHARACTER * wrapper.getQueryResults().getInitialColumnWidths().get(i));
            }

            List<Integer> columnTypes = wrapper.getQueryResults().getColumnTypes();
            List<List<Object>> data = wrapper.getQueryResults().getData();
            for (int i = 0; i < data.size(); ++i) {
                row = sheet.createRow(rownum++);
                List<Object> rowdata = data.get(i);
                for (int j = 1; j < rowdata.size(); j++) {
                    // Create cell - skip first data entry - this results is row num
                    cell = row.createCell(j-1);
                    if ((i % 2) == 0) {
                        cell.setCellStyle(detailStyle1);
                    } else {
                        cell.setCellStyle(detailStyle2);
                    }
                    Object val = rowdata.get(j);
                    if (val != null) {
                        switch (columnTypes.get(j)) {
                            case java.sql.Types.TINYINT:
                            case java.sql.Types.SMALLINT:
                            case java.sql.Types.INTEGER:
                            case java.sql.Types.BIGINT:
                            case java.sql.Types.REAL:
                            case java.sql.Types.DOUBLE:
                            case java.sql.Types.NUMERIC:
                            case java.sql.Types.DECIMAL:
                                cell.setCellValue(Double.valueOf(val.toString()));
                                break;
                            case java.sql.Types.DATE:
                                cell.setCellValue(Helper.getDate(val));
                                break;
                            case java.sql.Types.TIME:
                            case java.sql.Types.TIME_WITH_TIMEZONE:
                                cell.setCellValue(Helper.getTime(val));
                                break;
                            case java.sql.Types.TIMESTAMP:
                            case java.sql.Types.TIMESTAMP_WITH_TIMEZONE:
                                cell.setCellValue(Helper.getTimestamp(val));
                                break;
                            case java.sql.Types.CHAR:
                            case java.sql.Types.VARCHAR:
                            case java.sql.Types.LONGVARCHAR:
                            case java.sql.Types.CLOB:
                            case java.sql.Types.NCHAR:
                            case java.sql.Types.NVARCHAR:
                            case java.sql.Types.LONGNVARCHAR:
                            case java.sql.Types.NCLOB:
                                cell.setCellValue(val.toString());
                                break;
                            default:
                                cell.setCellValue(val.toString());
                                break;
                        }
                    }
                }
            }

            bos = new ByteArrayOutputStream();
            wb.write(bos);
            retval = bos.toByteArray();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        } finally {
            if (bos != null) {
                try {
                    bos.close();
                } catch (Exception ex) {
                };
            }
        }

        return retval;
    }

    
    @Override
    public OperationResult<DocumentNode> getAvailableDocuments(String documentType) {
        OperationResult<DocumentNode> retval = new OperationResult<>();

        long start = System.currentTimeMillis();
        
        User u = getCurrentUser();
        
        Set <String> hs = new HashSet(u.getRoles());
        List <DocumentGroup> groups = config.getDocumentGroupsConfig().getDocumentGroups();
        List <DocumentGroup> userDocGroups = new ArrayList();
        for (DocumentGroup g : groups) {
            if ((g.getRoles() == null) || g.getRoles().isEmpty()) {
                userDocGroups.add(g);
            } else {
                for (String r : g.getRoles()) {
                    if (hs.contains(r)) {
                        userDocGroups.add(g);
                        break;
                    }
                }
            }
        }
         
        
        Collections.sort(userDocGroups, new DocumentGroupComparator());
        
        int id = 0;
        DocumentNode rootNode = new DocumentNode(id++);
        DocumentNode currentNode = null;
        
        for (DocumentGroup g : userDocGroups) {
           if ((currentNode == null) || !g.getName().equals(currentNode.getMetadata().get("group"))) {
               currentNode = new DocumentNode(id++);
               currentNode.setName(g.getName());
               rootNode.getChildren().add(currentNode);
            }
            List <String> fileNames =  fileHandler.getGroupDocumentNames(documentType, g.getName());
        
            for (String fname : fileNames) {
                DocumentNode n = new DocumentNode(id++);
                n.getMetadata().put("group", g.getName());
                n.getMetadata().put("type", documentType);
                n.setName(fname);
                currentNode.getChildren().add(n);
            }
        }
        
        retval.setResult(rootNode);
        
        LOG.debug("getAvailableDocuments() - elapsed time: " + ((System.currentTimeMillis() - start) / 1000) + "sec");
        return retval;
    }

}
