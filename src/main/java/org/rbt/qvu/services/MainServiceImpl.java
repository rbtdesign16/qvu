package org.rbt.qvu.services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.client.utils.RoleInformation;
import org.rbt.qvu.client.utils.UserAttribute;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.SaveResult;
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

@Service
public class MainServiceImpl implements MainService {

    private static Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    private DataSources qvuds;

    @Autowired
    private Config config;

    Gson gson = new Gson();

    @PostConstruct
    private void init() {
        LOG.info("in MainServiceImpl.init()");
    }

    @Override
    public AuthData loadAuthData() throws Exception {
        AuthData retval = new AuthData();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (LOG.isDebugEnabled()) {
            LOG.debug("authetication=" + auth);
        }
        if ((auth != null) && StringUtils.isNotEmpty(auth.getName())) {
            String userId = auth.getName();
            SecurityConfiguration scfg = config.getSecurityConfig();
            if (auth.getPrincipal() instanceof DefaultOAuth2User) {
                DefaultOAuth2User oauser = (DefaultOAuth2User) auth.getPrincipal();
                if (StringUtils.isNotEmpty(oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME))) {
                    userId = oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME);
                }
            }

            QvuAuthenticationService authService = config.getSecurityConfig().getAuthenticatorService();

            retval.setAdministratorRole(scfg.getAdministratorRole());
            retval.setQueryDesignerRole(scfg.getQueryDesignerRole());
            retval.setReportDesignerRole(scfg.getReportDesignerRole());
            retval.setUserRole(scfg.getUserRole());

            // users and roles are defined via json
            if (scfg.isFileBasedSecurity()) {
                retval.getAllRoles().addAll(Constants.DEFAULT_ROLES);
                retval.setAllRoles(scfg.getBasicConfiguration().getRoles());
            } else if (authService != null) { // if we have a service defined we will try to loaf from there
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
            }

            // if we have users loaded try to find user based
            // on incoming user id
            if (StringUtils.isNotEmpty(userId)) {
                for (UserInformation u : retval.getAllUsers()) {
                    if (userId.equalsIgnoreCase(u.getUserId())) {
                        retval.setCurrentUser(u);
                        break;
                    }
                }
                if (retval.getCurrentUser() == null) {
                    UserInformation user = new UserInformation();
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
                LOG.debug("AuthData: " + gson.toJson(retval, AuthData.class));
            }
        }

        return retval;
    }

    @Override
    public List<DataSourceConfiguration> loadDatasources() {
        List<DataSourceConfiguration> retval = config.getDatasourcesConfig().getDatasources();
        if (LOG.isDebugEnabled()) {
            LOG.debug("Datasources: " + gson.toJson(retval, ArrayList.class));
        }
        return retval;
    }

    private void loadUserAttributes(UserInformation user, Map attributes) {
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
    public SaveResult saveDatasource(DataSourceConfiguration datasource) {
        SaveResult retval = new SaveResult();
        DataSourcesConfiguration datasources = null;
        try {
            File f = new File(config.getAppConfig().getDatabaseConfigurationFile());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                datasources = gson.fromJson(new String(bytes), DataSourcesConfiguration.class);

                if (datasources != null) {
                    int indx = -1;
                    for (int i = 0; i < datasources.getDatasources().size(); ++i) {
                        DataSourceConfiguration ds = datasources.getDatasources().get(i);
                        if (ds.getDatasourceName().equalsIgnoreCase(datasource.getDatasourceName())) {
                            indx = i;
                            break;
                        }
                    }

                    if (indx > -1) {
                        datasources.getDatasources().set(indx, datasource);
                    } else {
                        datasources.getDatasources().add(datasource);
                    }
                }
            }

            if (datasources != null) {
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {

                    Gson myGson = new GsonBuilder().setPrettyPrinting().create();
                    fos.write(myGson.toJson(datasources).getBytes());
                } catch (Exception ex) {
                    LOG.error(ex.toString(), ex);
                }
            }
        } catch (Exception ex) {
            retval.setError(true);
            retval.setMessage(ex.toString());
        }

        return retval;
    }

    @Override
    public SaveResult deleteDatasource(String datasourceName) {
        SaveResult retval = new SaveResult();
        DataSourcesConfiguration datasources = null;
        try {
            File f = new File(config.getAppConfig().getDatabaseConfigurationFile());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                datasources = gson.fromJson(new String(bytes), DataSourcesConfiguration.class);

                if (datasources != null) {
                    Iterator<DataSourceConfiguration> it = datasources.getDatasources().iterator();
                    while (it.hasNext()) {
                        DataSourceConfiguration ds = it.next();
                        if (ds.getDatasourceName().equalsIgnoreCase(datasourceName)) {
                            it.remove();
                            break;
                        }
                    }
                }
            }

            if (datasources != null) {
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {

                    Gson myGson = new GsonBuilder().setPrettyPrinting().create();
                    fos.write(myGson.toJson(datasources).getBytes());
                } catch (Exception ex) {
                    LOG.error(ex.toString(), ex);
                }
            }
        } catch (Exception ex) {
            retval.setError(true);
            retval.setMessage(ex.toString());
        }

        return retval;

    }

    @Override
    public SaveResult saveRole(RoleInformation role) {
        SaveResult retval = new SaveResult();

        return retval;

    }

    @Override
    public SaveResult deleteRole(String roleName) {
        SaveResult retval = new SaveResult();

        return retval;

    }

    @Override
    public SaveResult saveUser(UserInformation user) {
        SaveResult retval = new SaveResult();

        return retval;

    }

    @Override
    public SaveResult deleteUser(String userId) {
        SaveResult retval = new SaveResult();

        return retval;

    }
}
