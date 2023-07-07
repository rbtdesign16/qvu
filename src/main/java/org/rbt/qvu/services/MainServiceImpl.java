package org.rbt.qvu.services;

import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.SaveException;
import org.rbt.qvu.client.utils.UserAttribute;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.configuration.ConfigFileHandler;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.util.AuthHelper;
import static org.rbt.qvu.util.AuthHelper.isFirstNameAttribute;
import static org.rbt.qvu.util.AuthHelper.isLastNameAttribute;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.stereotype.Service;
import org.rbt.qvu.client.utils.SecurityService;
import org.rbt.qvu.configuration.ConfigBuilder;
import org.rbt.qvu.configuration.security.BasicConfiguration;
import org.rbt.qvu.dto.Column;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableAccess;
import org.rbt.qvu.util.DBHelper;
import org.rbt.qvu.util.Errors;
import org.rbt.qvu.util.Helper;
import org.rbt.qvu.util.RoleComparator;

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
    private ConfigFileHandler configFileHandler;

    @PostConstruct
    private void init() {
        LOG.info("in MainServiceImpl.init()");
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
            String userId = auth.getName();
            SecurityConfiguration scfg = config.getSecurityConfig();
            retval.setInitialSetupRequired(config.isInitialSetupRequired());
            if (auth.getPrincipal() instanceof DefaultOAuth2User) {
                DefaultOAuth2User oauser = (DefaultOAuth2User) auth.getPrincipal();
                if (StringUtils.isNotEmpty(oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME))) {
                    userId = oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME);
                }
            }

            SecurityService authService = config.getSecurityConfig().getAuthenticatorService();

            
            // always include the default role set
            retval.getAllRoles().addAll(Constants.DEFAULT_ROLES);
            
            // users and roles are defined via json
            if (scfg.isFileBasedSecurity()) {
                retval.getAllRoles().addAll(scfg.getBasicConfiguration().getRoles());
                retval.setAllUsers(scfg.getBasicConfiguration().getUsers());
            } else if (authService != null) { // if we have a service defined we will try to loaf from there
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
            }

            Collections.sort(retval.getAllRoles(), new RoleComparator());
            
            // if we have users loaded try to find user based
            // on incoming user id
            if (StringUtils.isNotEmpty(userId)) {
                for (User u : retval.getAllUsers()) {
                    if (userId.equalsIgnoreCase(u.getUserId())) {
                        retval.setCurrentUser(u);
                        break;
                    }
                }
                if (retval.getCurrentUser() == null) {
                    User user = new User();
                    user.setUserId(userId);
                    retval.setCurrentUser(user);
                }

                if (retval.getCurrentUser() != null) {
                    if (auth.getPrincipal() instanceof Saml2AuthenticatedPrincipal) {
                        loadUserAttributes(retval.getCurrentUser(), ((Saml2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
                    } else if (auth.getPrincipal() instanceof OAuth2AuthenticatedPrincipal) {
                        loadUserAttributes(retval.getCurrentUser(), ((OAuth2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
                    }
                }
            }

            retval.setAllowUserRoleEdit(scfg.isFileBasedSecurity() || scfg.isAllowServiceSave());

            if (LOG.isDebugEnabled()) {
                LOG.debug("AuthData: " + configFileHandler.getGson().toJson(retval, AuthData.class));
            }
        }

        return retval;
    }

    private void loadUserAttributes(User user, Map attributes) {
        for (Object o : attributes.keySet()) {
            Object val = attributes.get(o);
            if (val != null) {
                String att = o.toString();
                if (val instanceof Collection) {
                    int indx = 0;
                    for (Object o2 : (Collection) val) {
                        String val2 = o2.toString();
                        if (AuthHelper.isRealmAccess(att)) {
                            user.getRoles().addAll(AuthHelper.getRolesFromRealmAccess(val2));
                        } else if (AuthHelper.isRoleAttribute(config.getSecurityConfig(), att)) {
                            user.getRoles().add(AuthHelper.formatRoleAttribute(val2));
                        } else {
                            String attName = AuthHelper.formatAttributeName(att);

                            if (AuthHelper.isLastNameAttribute(att)) {
                                user.setLastName(val2);
                            } else if (AuthHelper.isFirstNameAttribute(attName)) {
                                user.setFirstName(val2);
                            } else {
                                if (indx == 0) {
                                    user.getAttributes().add(new UserAttribute(AuthHelper.formatAttributeName(att), val2));
                                } else {
                                    user.getAttributes().add(new UserAttribute(AuthHelper.formatAttributeName(att) + indx, val2));
                                }
                            }

                            indx++;
                        }
                    }
                } else {
                    if (isLastNameAttribute(att)) {
                        user.setLastName(val.toString());
                    } else if (isFirstNameAttribute(att)) {
                        user.setFirstName(val.toString());
                    } else {
                        if (AuthHelper.isRealmAccess(att)) {
                            user.getRoles().addAll(AuthHelper.getRolesFromRealmAccess(val.toString()));
                        } else if (AuthHelper.isRoleAttribute(config.getSecurityConfig(), att)) {
                            user.getRoles().add(AuthHelper.formatRoleAttribute(val.toString()));
                        } else {
                            user.getAttributes().add(new UserAttribute(AuthHelper.formatAttributeName(att), val.toString()));
                        }
                    }
                }
            }
        }
    }

    @Override
    public List<DataSourceConfiguration> loadDatasources() {
        return configFileHandler.loadDatasources();
    }

    @Override
    public OperationResult saveDatasource(DataSourceConfiguration datasource) {
        return configFileHandler.saveDatasource(datasource);
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
        return configFileHandler.deleteDatasource(datasourceName);
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
            retval = configFileHandler.saveRole(role);
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
            retval = configFileHandler.deleteRole(roleName);
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
            retval = configFileHandler.saveUser(user);
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
            retval = configFileHandler.deleteUser(userId);
        }

        return retval;
    }

    @Override
    public String loadLang(String langkey) {
        String retval = "";
        Map<String, String> langMap = config.getLangResources().get(langkey);
        if (langMap == null) {
            retval = configFileHandler.getGson(true).toJson(config.getLangResources().get(Constants.DEFAULT_LANGUAGE_KEY));
        } else {
            retval = configFileHandler.getGson(true).toJson(langMap);
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
                case Constants.BASIC_SECURITY_TYPE ->
                    securityConfig.setBasicConfiguration(getInitializedBasicConfig(initialSetup));
            }

            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-language.json"), new File(config.getLanguageFileName()));
            configFileHandler.saveSecurityConfig(securityConfig);

            FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/initial-datasource-configuration.json"), new File(config.getDatasourceConfigurationFileName()));
        } catch (Exception ex) {
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    private BasicConfiguration getInitializedBasicConfig(InitialSetup initialSetup) throws Exception {
        BasicConfiguration retval = ConfigBuilder.build(getClass().getResourceAsStream("/initial-security-configuration.json"), SecurityConfiguration.class).getBasicConfiguration();
        User u = retval.findUser(Constants.DEFAULT_ADMIN_USER);

        if (u != null) {
            u.setPassword(Helper.toMd5Hash(initialSetup.getAdminPassword()));
        } else {
            throw new SaveException(config.getLanguageText(initialSetup.getLangKey(), "Default admin user not found"));
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
    public OperationResult<List<Table>> getDatasourceTables(String datasourceName) {
        OperationResult<List<Table>> retval = new OperationResult();
        List<Table> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;
        try {
            DataSourceConfiguration ds = config.getDatasourcesConfig().getDatasourceConfiguration(datasourceName);

            if (ds != null) {
                conn = qvuds.getConnection(datasourceName);
                DatabaseMetaData dmd = conn.getMetaData();

                res = dmd.getTables(null, ds.getSchema(), "%", DBHelper.TABLE_TYPES);

                while (res.next()) {
                    Table t = new Table();
                    t.setDatasource(datasourceName);
                    t.setSchema(res.getString(2));
                    t.setName(res.getString(3));
                    t.setType(res.getString(4));
                    t.setColumns(getTableColumns(dmd, t));
                    setIndexColumns(dmd, t);
                    setPrimaryKeys(dmd, t);
                    data.add(t);
                }
                
                retval.setResult(data);
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

    private List<Column> getTableColumns(DatabaseMetaData dmd, Table t) throws Exception {
        List<Column> retval = new ArrayList<>();
        ResultSet res = null;

        try {
            res = dmd.getColumns(null, t.getSchema(), t.getName(), "%");

            while (res.next()) {
                Column c = new Column();
                c.setSchema(res.getString(2));
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
    
    private Set<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            Object o = auth.getPrincipal();
            
            if (o != null) {
                LOG.error("------>" + o.getClass().getName());
            }
        }
        
        return null;
    }

    @Override
    public OperationResult<List <TableAccess>> getTableAccess(DataSourceConfiguration ds) {
        OperationResult<List <TableAccess>> retval = new OperationResult();
        List <TableAccess> data = new ArrayList<>();
        Connection conn = null;
        ResultSet res = null;
        
        try {
            conn = qvuds.getConnection(ds.getDatasourceName());
            
            if (conn == null) {
                conn = DBHelper.getConnection(ds);
            }
            
            Map<String, TableAccess> tamap = new HashMap();
            
            if (ds.getTableAccessList() != null) {
                for (TableAccess ta : ds.getTableAccessList()) {
                    tamap.put(ta.getTableName(), ta);
                }
            }
            
            DatabaseMetaData dmd = conn.getMetaData();
            
            res = dmd.getTables(null, ds.getSchema(), "%", DBHelper.TABLE_TYPES);
            
            while (res.next()) {
                String tname = res.getString(3);
                
                TableAccess curta = tamap.get(tname);
                if (curta == null) {
                    TableAccess tanew = new TableAccess();
                    tanew.setDatasourceName(ds.getDatasourceName());
                    tanew.setTableName(tname);
                    data.add(tanew);
                } else {
                    data.add(curta);
                }
            }
            
            Collections.sort(data);
            retval.setResult(data);
        }
        
        catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
        
        finally {
            DBHelper.closeConnection(conn, null, res);
        }
        
        return retval;
    }  
        
}
