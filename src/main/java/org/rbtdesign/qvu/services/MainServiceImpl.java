package org.rbtdesign.qvu.services;

import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import org.rbtdesign.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;

import javax.annotation.PostConstruct;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SerializationUtils;
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
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.User;
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.util.FileHandler;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.configuration.security.SecurityConfiguration;
import org.rbtdesign.qvu.dto.AuthData;
import org.rbtdesign.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import org.rbtdesign.qvu.client.utils.SecurityService;
import org.rbtdesign.qvu.configuration.security.BasicConfiguration;
import org.rbtdesign.qvu.configuration.security.OidcConfiguration;
import org.rbtdesign.qvu.dto.AuthConfig;
import org.rbtdesign.qvu.dto.Column;
import org.rbtdesign.qvu.dto.ColumnSettings;
import org.rbtdesign.qvu.dto.DocumentGroup;
import org.rbtdesign.qvu.dto.DocumentNode;
import org.rbtdesign.qvu.dto.DocumentSchedule;
import org.rbtdesign.qvu.dto.DocumentWrapper;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.ForeignKey;
import org.rbtdesign.qvu.dto.ForeignKeySettings;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.QueryDocumentRunWrapper;
import org.rbtdesign.qvu.dto.QueryParameter;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.QuerySelectNode;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.SqlFrom;
import org.rbtdesign.qvu.dto.SqlSelectColumn;
import org.rbtdesign.qvu.dto.Table;
import org.rbtdesign.qvu.dto.TableColumnNames;
import org.rbtdesign.qvu.dto.TableSettings;
import org.rbtdesign.qvu.util.CacheHelper;
import org.rbtdesign.qvu.util.ConfigBuilder;
import org.rbtdesign.qvu.util.DBHelper;
import org.rbtdesign.qvu.util.DatasourceSettingsHelper;
import org.rbtdesign.qvu.util.DocumentGroupComparator;
import org.rbtdesign.qvu.util.DocumentScheduleComparator;
import org.rbtdesign.qvu.util.Errors;
import org.rbtdesign.qvu.util.Helper;
import org.rbtdesign.qvu.util.QuerySelectTreeBuilder;
import org.rbtdesign.qvu.util.RoleComparator;
import org.rbtdesign.qvu.util.ObjectGraphColumnComparator;
import org.rbtdesign.qvu.util.ZipFolder;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class MainServiceImpl implements MainService {
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    private DataSources qvuds;

    @Autowired
    private ConfigurationHelper config;

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

        if (LOG.isTraceEnabled()) {
            LOG.trace("local=" + request.getLocale().toLanguageTag());
            LOG.trace("authetication=" + auth);
        }
        if ((auth != null) && StringUtils.isNotEmpty(auth.getName())) {
            retval.setCurrentUser(getCurrentUser());
            boolean localUser = isLocalUser();
            retval.setAllowUserAdd(localUser);

            SecurityConfiguration scfg = config.getSecurityConfig();
            retval.setInitializingApplication(config.isInitializingApplication());

            BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();
            SecurityService authService = basicConfig.getSecurityService();

            // users and roles are defined via json
            if (authService != null) { // if we have a service defined we will try to loaf from there
                retval.setAllowUserDelete(false);
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
            } else {
                retval.setAllowUserDelete(true);
                retval.getAllRoles().addAll(scfg.getRoles());
                retval.setAllUsers(scfg.getUsers());
            }

            Collections.sort(retval.getAllRoles(), new RoleComparator());

            // clone it so we can send a modified copy back
            retval = SerializationUtils.clone(retval);

            // remove the passwords
            for (User u : retval.getAllUsers()) {
                u.setPassword(null);
            }

            if (LOG.isTraceEnabled()) {
                LOG.trace("AuthData: " + fileHandler.getGson().toJson(retval, AuthData.class));
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
            LOG.error(ex.toString(), ex);
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
        BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();

        if (basicConfig.getSecurityService() != null) {
            try {
                role.setNewRecord(false);
                retval = basicConfig.getSecurityService().saveRole(role);
            } catch (Exception ex) {
                Errors.populateError(retval, ex);
            }
        } else {
            retval = fileHandler.saveRole(role);
        }

        return retval;
    }

    @Override
    public OperationResult deleteRole(String roleName) {
        OperationResult retval = new OperationResult();
        BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();

        if (basicConfig.getSecurityService() != null) {
            try {
                retval = basicConfig.getSecurityService().deleteRole(roleName);
            } catch (Exception ex) {
                Errors.populateError(retval, ex);
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
            Errors.populateError(retval, ex);
        }
        return retval;
    }

    @Override
    public OperationResult deleteDocumentGroup(String groupName) {
        OperationResult retval = new OperationResult();
        try {
            User u = getCurrentUser();
            retval = fileHandler.deleteDocumentGroup(groupName, u.getName());
        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    @Override
    public OperationResult saveUser(User user) {
        OperationResult retval = new OperationResult();
        BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();

        if (basicConfig.getSecurityService() != null) {
            try {
                user.setNewRecord(false);
                retval = basicConfig.getSecurityService().saveUser(user);
            } catch (Exception ex) {
                Errors.populateError(retval, ex);
            }
        } else {
            retval = fileHandler.saveUser(user);
        }

        return retval;
    }

    @Override
    public OperationResult deleteUser(String userId) {
        OperationResult retval = new OperationResult();
        BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();

        if (basicConfig.getSecurityService() != null) {
            try {
                retval = basicConfig.getSecurityService().deleteUser(userId);
            } catch (Exception ex) {
                Errors.populateError(retval, ex);
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

        if (LOG.isTraceEnabled()) {
            LOG.trace("Language File: " + retval);
        }

        return retval;
    }

    @Override
    public OperationResult initializeRepository(String initialInfo) {
        OperationResult retval = new OperationResult();
        FileOutputStream fos = null;
        try {
            int pos = initialInfo.indexOf("|");

            String repositoryFolder = initialInfo.substring(0, pos);
            String adminPassword = initialInfo.substring(pos + 1);

            File f = new File(repositoryFolder + File.separator + "documents");
            f.mkdirs();
            f = new File(repositoryFolder + File.separator + "logs");
            f.mkdirs();
            f = new File(repositoryFolder + File.separator + "help");
            f.mkdirs();
            f = new File(repositoryFolder + File.separator + "backups");
            f.mkdirs();

            config.setRepositoryFolder(repositoryFolder);
            config.setSecurityType(Constants.BASIC_SECURITY_TYPE);

            File propsFile = new File(repositoryFolder + File.separator + "config" + File.separator + "application.properties");
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-language.json"), new File(config.getLanguageFileName()));
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-datasource-configuration.json"), new File(config.getDatasourceConfigurationFileName()));
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-security-configuration.json"), new File(config.getSecurityConfigurationFileName()));
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-application.properties"), propsFile);
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/qvu-help.pdf"), new File(config.getHelpFolder() + File.separator + "qvu-help-en-US.pdf"));
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/qvu-gettingstarted.pdf"), new File(config.getHelpFolder() + File.separator + "qvu-gettingstarted-en-US.pdf"));
            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-scheduler.properties"), new File(config.getHelpFolder() + File.separator + "scheduler.properties"));

            // update admin password
            SecurityConfiguration securityConfig = ConfigBuilder.build(config.getSecurityConfigurationFileName(), SecurityConfiguration.class);
            User u = securityConfig.findUser("admin");
            u.setPassword(Helper.toMd5Hash(adminPassword));
            fileHandler.saveSecurityConfig(securityConfig);

            String s = FileUtils.readFileToString(propsFile, "UTF-8");
            s = s.replace("${repository}", repositoryFolder);
            FileUtils.write(propsFile, s, "UTF-8");

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        } finally {
            if (fos != null) {
                try {
                    fos.close();
                } catch (Exception ex) {
                    if (retval.isSuccess()) {
                        Errors.populateError(retval, ex);
                    }
                };
            }
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
            if (LOG.isTraceEnabled()) {
                LOG.trace("user: " + user.getName());
                for (String s : user.getRoles()) {
                    LOG.trace("\trole: " + s);
                }
            }

            Set<String> userRoles = new HashSet<>(user.getRoles());

            DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(datasourceName);
            QuerySelectNode node = QuerySelectTreeBuilder.build(
                    fileHandler,
                    datasourceSettingsHelper,
                    ds,
                    userRoles,
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
                        customForeignKeys.put(fk.getTableName(), fklist = new ArrayList<>());
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
                        t.setColumns(getTableColumns(ds, dmd, t));
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
        ResultSet res = null;
        Map<String, Column> cmap = new HashMap<>();
        for (Column c : t.getColumns()) {
            cmap.put(c.getName().toLowerCase(), c);
        }

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

    private List<Column> getTableColumns(DataSourceConfiguration ds, DatabaseMetaData dmd, Table t) throws Exception {
        List<Column> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getColumns(null, t.getSchema(), t.getName(), "%");

            while (res.next()) {
                Column c = new Column();
                c.setSchema(res.getString(2));
                c.setDatasource(ds.getDatasourceName());
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
                if (o instanceof User user) {
                    retval = user;
                } else if (o instanceof DefaultOAuth2User defaultOAuth2User) {
                    retval = toUser(defaultOAuth2User);
                }
            }
        }

        return retval;
    }

    private SecurityConfiguration getSecurityConfig() {
        return config.getSecurityConfig();
    }

    private boolean hasAdminRoleMapping(DefaultOAuth2User u, OidcConfiguration oidcConfig) {
        boolean retval = false;

        if (StringUtils.isNotEmpty(oidcConfig.getRoleClaimPropertyName())
                && StringUtils.isNotEmpty(oidcConfig.getIncomingAdminRoles())) {
            List<String> roles = (List<String>) u.getAttribute(oidcConfig.getRoleClaimPropertyName());

            if ((roles != null) && !roles.isEmpty()) {
                Set<String> inRoles = new HashSet<>();

                StringTokenizer st = new StringTokenizer(oidcConfig.getIncomingAdminRoles(), ",");

                while (st.hasMoreTokens()) {
                    inRoles.add(st.nextToken());
                }

                for (String r : roles) {

                    if (inRoles.contains(r)) {
                        retval = true;
                        break;
                    }
                }
            }
        }

        return retval;
    }

    private User toUser(DefaultOAuth2User u) {
        User retval = null;
        String nm = null;

        OidcConfiguration oidcConfig = getSecurityConfig().getOidcConfiguration();

        if (oidcConfig.isUseEmailForUserId()) {
            nm = u.getAttribute(StandardClaimNames.EMAIL);
        } else {
            nm = u.getAttribute(StandardClaimNames.PREFERRED_USERNAME);
        }

        if (StringUtils.isEmpty(nm)) {
            nm = u.getName();
        }

        if (StringUtils.isNotEmpty(nm)) {
            retval = getSecurityConfig().findUser(nm);

            // add authenticated user to local user list
            if (retval == null) {
                retval = new User();

                retval.setUserId(nm);
                retval.setEmail(u.getAttribute(StandardClaimNames.EMAIL));
                retval.setFirstName(u.getAttribute(StandardClaimNames.GIVEN_NAME));
                retval.setLastName(u.getAttribute(StandardClaimNames.FAMILY_NAME));

                if (hasAdminRoleMapping(u, getSecurityConfig().getOidcConfiguration())) {
                    retval.getRoles().add(Constants.DEFAULT_ADMINISTRATOR_ROLE);
                }

            }

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
    public OperationResult<List<ForeignKeySettings>> getForeignKeySettings(DataSourceConfiguration ds, String tableName) {
        OperationResult<List<ForeignKeySettings>> retval = new OperationResult<>();
        List<ForeignKeySettings> data = new ArrayList<>();
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

            Set<String> curfkset = new HashSet<>();
            Map<String, ForeignKeySettings> fkmap = new HashMap();

            if (tset != null) {
                for (ForeignKeySettings fkset : tset.getForeignKeySettings()) {
                    data.add(fkset);
                    curfkset.add(fkset.getForeignKeyName());
                }
            }

            for (ForeignKey cfk : ds.getCustomForeignKeys()) {
                if (!curfkset.contains(cfk.getName())) {
                    ForeignKeySettings fks = new ForeignKeySettings();
                    fks.setDatasourceName(ds.getDatasourceName());
                    fks.setToTableName(cfk.getTableName());
                    fks.setForeignKeyName(cfk.getName());
                    fks.setTableName(tableName);
                    fks.setType(cfk.isImported() ? Constants.IMPORTED_FOREIGN_KEY_TYPE : Constants.EXPORTED_FOREIGN_KEY_TYPE);
                    fks.setToColumns(cfk.getToColumns());
                    fks.setColumns(cfk.getColumns());
                    data.add(fks);
                }
            }

            DatabaseMetaData dmd = conn.getMetaData();

            res = dmd.getImportedKeys(null, ds.getSchema(), tableName);

            while (res.next()) {
                String toTable = res.getString(3);
                String toColumn = res.getString(4);
                String fromColumn = res.getString(8);
                String fkName = res.getString(12);
                if (!curfkset.contains(fkName)) {
                    ForeignKeySettings fk = fkmap.get(fkName);

                    if (fk == null) {
                        fk = new ForeignKeySettings();
                        fk.setDatasourceName(ds.getDatasourceName());
                        fk.setToTableName(toTable);
                        fk.setForeignKeyName(fkName);
                        fk.setTableName(tableName);
                        fk.setType(Constants.IMPORTED_FOREIGN_KEY_TYPE);
                        fkmap.put(fkName, fk);
                        data.add(fk);
                    }

                    fk.getToColumns().add(toColumn);
                    fk.getColumns().add(fromColumn);
                }
            }

            res = dmd.getExportedKeys(null, ds.getSchema(), tableName);

            while (res.next()) {
                String toColumn = res.getString(8);
                String toTable = res.getString(7);
                String fromColumn = res.getString(4);
                String fkName = res.getString(12);

                if (!curfkset.contains(fkName)) {
                    ForeignKeySettings fk = fkmap.get(fkName);

                    if (fk == null) {
                        fk = new ForeignKeySettings();
                        fk.setDatasourceName(ds.getDatasourceName());
                        fk.setToTableName(toTable);
                        fk.setForeignKeyName(fkName);
                        fk.setTableName(tableName);
                        fk.setType(Constants.EXPORTED_FOREIGN_KEY_TYPE);
                        fkmap.put(fkName, fk);
                        data.add(fk);
                    }

                    fk.getToColumns().add(toColumn);
                    fk.getColumns().add(fromColumn);
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
        OperationResult retval = null;
        try {
            if (Constants.DOCUMENT_TYPE_QUERY.equals(type)) {
                User u = getCurrentUser();
                retval = getQueryDocument(group, name, u.getName());
            } else {
                retval = new OperationResult();
                retval.setErrorCode(Errors.NOT_SUPPORTED);
                retval.setMessage(config.getLanguageText(Constants.DEFAULT_LANGUAGE_KEY, Errors.getMessage(Errors.NOT_SUPPORTED)));
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
        return retval;
    }

    @Override
    public OperationResult<DocumentWrapper> saveDocument(@RequestBody DocumentWrapper docWrapper) {
        OperationResult<DocumentWrapper> retval = new OperationResult();
        try {
            if (docWrapper.getReportDocument() != null) {
                ReportDocument doc = docWrapper.getReportDocument();
                if (doc.getCreateDate() == null) {
                    doc.setCreateDate(docWrapper.getActionTimestamp());
                    doc.setCreatedBy(docWrapper.getUser());
                } else {
                    doc.setLastUpdated(docWrapper.getActionTimestamp());
                    doc.setUpdatedBy(docWrapper.getUser());
                }

                OperationResult<ReportDocument> opr = fileHandler.saveReportDocument(doc, docWrapper.getUser());

                docWrapper.setReportDocument(opr.getResult());
                retval.setErrorCode(opr.getErrorCode());
                retval.setMessage(opr.getMessage());
            } else if (docWrapper.getQueryDocument() != null) {
                QueryDocument doc = docWrapper.getQueryDocument();
                if (doc.getCreateDate() == null) {
                    doc.setCreateDate(docWrapper.getActionTimestamp());
                    doc.setCreatedBy(docWrapper.getUser());
                } else {
                    doc.setLastUpdated(docWrapper.getActionTimestamp());
                    doc.setUpdatedBy(docWrapper.getUser());
                }
                OperationResult<QueryDocument> opr = fileHandler.saveQueryDocument(doc, docWrapper.getUser());
                docWrapper.setQueryDocument(opr.getResult());
                retval.setErrorCode(opr.getErrorCode());
                retval.setMessage(opr.getMessage());

                if (retval.isSuccess()) {
                    String key = docWrapper.getGroup() + "." + doc.getName();
                    cacheHelper.getQueryDocumentCache().remove(key);
                }
            }

            retval.setResult(docWrapper);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    @Override
    public OperationResult deleteDocument(String type, String group, String name) {
        User u = getCurrentUser();
        return fileHandler.deleteDocument(type, group, u.getName(), name);
    }

    private QueryResult getQueryResult(ResultSet res) throws SQLException {
        QueryResult retval = new QueryResult();

        ResultSetMetaData rmd = res.getMetaData();

        // rowcount 
        retval.getHeader().add("");
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
                    // format timestamp
                    if (rmd.getColumnType(i + 1) == java.sql.Types.TIMESTAMP) {
                        if (o instanceof LocalDateTime localDateTime) {
                            o = Timestamp.valueOf(localDateTime);
                        }
                    }
                }

                row.add(o);
            }
            retval.getData().add(row);
        }

        retval.setRowCount(rowcnt);

        if (rowcnt > 0) {
            for (Integer i = 0; i < cwidths.length; ++i) {
                Integer hdrlen = (retval.getHeader().get(i + 1).length() + 4);

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
                retval.getInitialColumnWidths().add(retval.getHeader().get(i + 1).length() + 4);
            }
        }

        return retval;
    }

    private OperationResult<QueryDocument> getQueryDocument(String group, String name, String user) {
        OperationResult<QueryDocument> retval = new OperationResult<>();

        String key;
        if (Constants.DEFAULT_DOCUMENT_GROUP.equals(group)) {
            key = group + "." + user + "." + name;
        } else {
            key = group + "." + name;
        }

        QueryDocument doc = cacheHelper.getQueryDocumentCache().get(key);

        if (doc == null) {
            retval = fileHandler.getDocument(FileHandler.QUERY_FOLDER, group, user, name);
        } else {
            retval.setResult(doc);
        }

        return retval;
    }

    @Override
    public OperationResult<QueryResult> runQuery(QueryRunWrapper runWrapper) {
        OperationResult<QueryDocument> res = getQueryDocument(runWrapper.getGroupName(), runWrapper.getDocumentName(), runWrapper.getUser());

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
                    ps.setObject(i + 1, p.getValue(), dbHelper.getJdbcTypeFromName(p.getDataTypeName()));
                }
                res = ps.executeQuery();
            } else {
                stmt = conn.createStatement();
                res = stmt.executeQuery(sql);
            }

            retval.setResult(getQueryResult(res));
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
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
            headerFont.setColor(new XSSFColor(rgbB, null).getIndex());
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
            detailFont.setColor(new XSSFColor(rgbB, null).getIndex());
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
                cell = row.createCell(i - 1);
                cell.setCellValue(header.get(i));
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i - 1, 25 * Constants.DEFAULT_PIXELS_PER_CHARACTER * wrapper.getQueryResults().getInitialColumnWidths().get(i));
            }

            List<Integer> columnTypes = wrapper.getQueryResults().getColumnTypes();
            List<List<Object>> data = wrapper.getQueryResults().getData();
            for (int i = 0; i < data.size(); ++i) {
                row = sheet.createRow(rownum++);
                List<Object> rowdata = data.get(i);
                for (int j = 1; j < rowdata.size(); j++) {
                    // Create cell - skip first data entry - this results is row num
                    cell = row.createCell(j - 1);
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

        Set<String> hs = new HashSet(u.getRoles());
        List<DocumentGroup> groups = config.getDocumentGroupsConfig().getDocumentGroups();
        List<DocumentGroup> userDocGroups = new ArrayList();
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

        hs.clear();
        for (DocumentGroup g : userDocGroups) {
            if (!hs.contains(g.getName())) {
                if ((currentNode == null)
                        || !g.getName().equals(currentNode.getMetadata().get("group"))) {
                    currentNode = new DocumentNode(id++);
                    currentNode.setName(g.getName());
                    rootNode.getChildren().add(currentNode);
                }

                List<String> fileNames = fileHandler.getGroupDocumentNames(documentType, g.getName(), u.getName());

                for (String fname : fileNames) {
                    DocumentNode n = new DocumentNode(id++);
                    n.getMetadata().put("group", g.getName());
                    n.getMetadata().put("type", documentType);
                    n.setName(fname);
                    currentNode.getChildren().add(n);
                }
                hs.add(g.getName());
            }
        }

        // remove any empty folders
        Iterator<DocumentNode> it = rootNode.getChildren().iterator();
        while (it.hasNext()) {
            DocumentNode f = it.next();

            if ((f.getChildren() == null) || f.getChildren().isEmpty()) {
                it.remove();
            }
        }

        retval.setResult(rootNode);

        LOG.debug("getAvailableDocuments() - elapsed time: " + ((System.currentTimeMillis() - start) / 1000) + "sec");
        return retval;
    }

    @Override
    public OperationResult<List<LinkedHashMap<String, Object>>> runJsonQuery(QueryRunWrapper runWrapper) {
        OperationResult<List<LinkedHashMap<String, Object>>> retval = new OperationResult<>();

        OperationResult<QueryResult> res = runQuery(runWrapper);

        if (res.isSuccess()) {
            QueryResult result = res.getResult();
            retval.setResult(new ArrayList<>());
            for (List<Object> rowdata : result.getData()) {
                LinkedHashMap row = new LinkedHashMap();
                for (int i = 1; i < result.getHeader().size(); ++i) {
                    row.put(result.getHeader().get(i), rowdata.get(i));
                }

                retval.getResult().add(row);
            }
        } else {
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
        }

        return retval;
    }

    private List<LinkedHashMap<String, Object>> buildResultsObjectGraph(Map<String, List<String>> pkMap, QueryDocument doc, QueryResult res) {
        List<LinkedHashMap<String, Object>> retval = new ArrayList<>();
        Map<String, List<LinkedHashMap<String, Object>>> dataMap = new HashMap<>();

        // base table will be the returned list
        dataMap.put("t0", retval);
        Set<String> dataKeySet = new HashSet<>();

        // build a list of the table aliaeses
        Set<String> tableAliases = new HashSet<>();
        for (SqlFrom f : doc.getFromClause()) {
            tableAliases.add(f.getAlias());
        }

        Map<String, List<Integer[]>> aliasColumnPosMap = new HashMap<>();

        int indx1 = 0;
        int indx2 = 0;
        for (SqlSelectColumn c : doc.getSelectColumns()) {
            if (c.isShowInResults()) {
                List<Integer[]> l = aliasColumnPosMap.get(c.getTableAlias());

                if (l == null) {
                    aliasColumnPosMap.put(c.getTableAlias(), l = new ArrayList<>());
                }

                Integer[] pos = {indx1, indx2++};
                l.add(pos);
            }
            indx1++;
        }

        for (List<Object> row : res.getData()) {
            for (String alias : tableAliases) {
                StringBuilder dataKey = new StringBuilder();
                dataKey.append(alias);
                List<Integer[]> cpos = aliasColumnPosMap.get(alias);
                for (Integer[] pos : cpos) {
                    SqlSelectColumn c = doc.getSelectColumns().get(pos[0]);
                    List<String> pkl = pkMap.get(c.getTableAlias() + "." + c.getTableName());
                    if (pkl.contains(c.getColumnName())) {
                        dataKey.append(".");
                        // add one becausr first result row value is row number
                        dataKey.append(row.get(pos[1] + 1));
                    }
                }

                List<LinkedHashMap<String, Object>> l = dataMap.get(alias);
                if (l == null) {
                    dataMap.put(alias, l = new ArrayList<>());
                }

                if (!dataKeySet.contains(dataKey.toString())) {
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();

                    for (Integer[] pos : cpos) {
                        SqlSelectColumn c = doc.getSelectColumns().get(pos[0]);
                        // add one becausr first result row value is row number
                        data.put(c.getColumnName(), row.get(pos[1] + 1));
                    }

                    l.add(data);
                    dataKeySet.add(dataKey.toString());
                }
            }
        }

        Map<String, ForeignKeySettings> fkSettingsMap = getDocumentTableForeignKeySettings(doc);

        for (LinkedHashMap<String, Object> r : dataMap.get("t0")) {
            buildObjectGraph(doc, fkSettingsMap, dataMap, "t0", r);
        }
        return retval;
    }

    private void buildObjectGraph(QueryDocument doc, Map<String, ForeignKeySettings> fkSettingsMap, Map<String, List<LinkedHashMap<String, Object>>> dataMap, String alias, LinkedHashMap<String, Object> parent) {
        for (SqlFrom f : doc.getFromClause()) {
            if (alias.equals(f.getFromAlias())) {
                List<LinkedHashMap<String, Object>> l = dataMap.get(f.getAlias());
                if ((l != null) && !l.isEmpty()) {
                    ForeignKeySettings fks = fkSettingsMap.get(f.getFromAlias() + "." + f.getForeignKeyName());

                    String fieldName = f.getForeignKeyName();
                    if ((fks != null) && StringUtils.isNotEmpty(fks.getFieldName())) {
                        fieldName = fks.getFieldName();
                    }

                    if (f.isImportedForeignKey()) {
                        parent.put(fieldName, l.get(0));
                    } else {
                        parent.put(fieldName, l);
                    }

                    for (LinkedHashMap<String, Object> r : l) {
                        buildObjectGraph(doc, fkSettingsMap, dataMap, f.getAlias(), r);
                    }
                }
            }
        }
    }

    private List<String> getPrimaryKeyColumnNames(Table t) {
        List<String> retval = new ArrayList<>();

        for (Column c : t.getColumns()) {
            if (c.getPkIndex() > 0) {
                retval.add(c.getName());
            }
        }

        return retval;
    }

    private List<String> getPrimaryKeyColumnNames(String datasource, String schema, String table) {
        List<String> retval = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;

        try {
            conn = qvuds.getConnection(datasource);

            DatabaseMetaData dmd = conn.getMetaData();

            res = dmd.getPrimaryKeys(null, schema, table);

            while (res.next()) {
                retval.add(res.getString(4));
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        } finally {
            dbHelper.closeConnection(conn, null, res);
        }

        return retval;
    }

    private Map<String, List<String>> getDocumentTablePKColumnNames(QueryDocument doc) {
        Map<String, List<String>> retval = new HashMap<>();

        // load up the primary key columns for each table
        // we will need to ensure that these are selected
        // for an object graph query;
        for (SqlFrom f : doc.getFromClause()) {
            if (!retval.containsKey(f.getTable())) {
                String key = doc.getDatasource() + "." + f.getTable();
                Table t = cacheHelper.getTableCache().get(key);

                if (t != null) {
                    retval.put(f.getAlias() + "." + f.getTable(), getPrimaryKeyColumnNames(t));
                } else {
                    retval.put(f.getAlias() + "." + f.getTable(), getPrimaryKeyColumnNames(doc.getDatasource(), doc.getSchema(), f.getTable()));
                }
            }
        }

        return retval;
    }

    private Map<String, ForeignKeySettings> getDocumentTableForeignKeySettings(QueryDocument doc) {
        Map<String, ForeignKeySettings> retval = new HashMap<>();

        DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(doc.getDatasource());

        Map<String, ForeignKeySettings> tfkMap = new HashMap<>();

        for (TableSettings ts : ds.getDatasourceTableSettings()) {
            for (ForeignKeySettings fks : ts.getForeignKeySettings()) {
                String key = ts.getTableName() + "." + fks.getForeignKeyName();
                tfkMap.put(key, fks);
            }
        }

        Map<String, String> aliasMap = new HashMap<>();
        for (SqlFrom f : doc.getFromClause()) {
            aliasMap.put(f.getAlias(), f.getTable());
        }

        for (SqlFrom f : doc.getFromClause()) {
            if (StringUtils.isNotEmpty(f.getForeignKeyName())) {
                ForeignKeySettings fks = tfkMap.get(aliasMap.get(f.getFromAlias()) + "." + f.getForeignKeyName());
                if (fks != null) {
                    retval.put(f.getFromAlias() + "." + f.getForeignKeyName(), fks);
                }
            }
        }

        return retval;
    }

    private QueryDocument toObjectGraphQueryDoc(Map<String, List<String>> pkMap, QueryDocument doc) {
        QueryDocument retval = SerializationUtils.clone(doc);
        Map<String, Set<String>> cMap = new HashMap<>();

        for (SqlSelectColumn c : doc.getSelectColumns()) {
            Set<String> hs = cMap.get(c.getTableName());
            if (hs == null) {
                cMap.put(c.getTableAlias() + "." + c.getTableName(), hs = new HashSet<>());
            }

            hs.add(c.getTableAlias() + "." + c.getColumnName());
        }

        for (String t : pkMap.keySet()) {
            List<String> pkset = pkMap.get(t);
            Set<String> cset = cMap.get(t);

            StringTokenizer st = new StringTokenizer(t, ".");
            String alias = st.nextToken();
            String table = st.nextToken();

            int indx = 1;
            for (String c : pkset) {
                // add any pk columns that are not in original select
                if (!cset.contains(alias + "." + c)) {
                    SqlSelectColumn scol = new SqlSelectColumn();
                    scol.setColumnName(c);
                    scol.setDatasource(doc.getDatasource());
                    scol.setTableName(table);
                    scol.setTableAlias(alias);
                    scol.setShowInResults(true);
                    scol.setPkIndex(indx++);
                    retval.getSelectColumns().add(scol);
                }
            }
        }

        Collections.sort(retval.getSelectColumns(), new ObjectGraphColumnComparator());

        return retval;
    }

    private boolean hasAggregateFields(QueryDocument doc) {
        boolean retval = false;

        for (SqlSelectColumn c : doc.getSelectColumns()) {
            if (StringUtils.isNotEmpty(c.getAggregateFunction())) {
                retval = true;
                break;
            }
        }

        return retval;
    }

    @Override
    public OperationResult<List<LinkedHashMap<String, Object>>> runJsonObjectGraphQuery(QueryRunWrapper runWrapper) {
        OperationResult<List<LinkedHashMap<String, Object>>> retval = new OperationResult<>();

        OperationResult<QueryDocument> res = getQueryDocument(runWrapper.getGroupName(), runWrapper.getDocumentName(), runWrapper.getUser());

        if (res.isSuccess()) {
            if (hasAggregateFields(res.getResult())) {
                retval.setErrorCode(Errors.OBJECT_GRAPH_DOES_NOT_SUPPORT_AGGREGATE);
                retval.setMessage(config.getLanguageText(Constants.DEFAULT_LANGUAGE_KEY, Errors.getMessage(Errors.OBJECT_GRAPH_DOES_NOT_SUPPORT_AGGREGATE)));
            } else {
                QueryDocument doc = res.getResult();
                QueryDocumentRunWrapper wrapper = new QueryDocumentRunWrapper();

                Map<String, List<String>> pkMap = getDocumentTablePKColumnNames(doc);

                // need to ensure all primary keys are included in select
                // so we will update the incoming doc if required
                QueryDocument ogdoc = toObjectGraphQueryDoc(pkMap, doc);

                wrapper.setDocument(ogdoc);
                wrapper.setParameters(runWrapper.getParameters());
                OperationResult<QueryResult> qres = runQuery(wrapper);

                if (qres.isSuccess()) {
                    retval.setResult(buildResultsObjectGraph(pkMap, ogdoc, qres.getResult()));
                } else {
                    retval.setErrorCode(res.getErrorCode());
                    retval.setMessage(res.getMessage());
                }
            }
        } else {
            retval.setErrorCode(res.getErrorCode());
            retval.setMessage(res.getMessage());
        }

        if (LOG.isTraceEnabled()) {
            LOG.trace(fileHandler.getGson(true).toJson(retval));
        }

        return retval;
    }

    @Override
    public OperationResult<AuthConfig> getAuthConfig() {
        OperationResult<AuthConfig> retval = new OperationResult<>();

        SecurityConfiguration scfg = config.getSecurityConfig();
        AuthConfig result = new AuthConfig();

        result.setBasicConfiguration(scfg.getBasicConfiguration());
        result.setOidcConfiguration(scfg.getOidcConfiguration());
        result.setSecurityType(config.getSecurityType());

        retval.setResult(result);
        if (LOG.isTraceEnabled()) {
            LOG.trace("AuthConfig: " + fileHandler.getGson(true).toJson(result));
        }

        return retval;
    }

    @Override
    public OperationResult saveAuthConfig(AuthConfig authConfig) {
        OperationResult<AuthConfig> retval = new OperationResult<>();
        FileInputStream fis = null;
        FileOutputStream fos = null;
        try {
            SecurityConfiguration scfg = config.getSecurityConfig();

            scfg.setBasicConfiguration(authConfig.getBasicConfiguration());
            scfg.setOidcConfiguration(authConfig.getOidcConfiguration());
            config.setSecurityType(authConfig.getSecurityType());

            fileHandler.saveSecurityConfig(scfg);
            fileHandler.updateApplicationProperties(authConfig);

        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        } finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (Exception ex) {
                };
            }

            if (fos != null) {
                try {
                    fos.close();
                } catch (Exception ex) {
                };
            }
        }

        return retval;
    }

    @Override
    public OperationResult<String> doBackup() {
        OperationResult<String> retval = new OperationResult();
        File f = new File(config.getBackupFolder() + File.separator + "qvu-backup-" + Helper.TS2.format(new Date()) + ".zip");
        boolean res = ZipFolder.doZip(new File(config.getRepositoryFolder()), f);

        if (res) {
            retval.setResult(f.getAbsolutePath());
        } else {
            Errors.populateError(retval, Errors.BACKUP_FAILED);
        }

        return retval;

    }

    @Override
    public OperationResult<List<DocumentSchedule>> getDocumentSchedules() {
        OperationResult<List<DocumentSchedule>> retval = new OperationResult<>();
         
        List <DocumentSchedule> sched = config.getDocumentSchedulesConfig().getDocumentSchedules();
        
        Collections.sort(sched, new DocumentScheduleComparator());
        
        retval.setResult(sched);
        
        return retval;
    }

}
