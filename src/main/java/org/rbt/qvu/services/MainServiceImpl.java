package org.rbt.qvu.services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
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
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.stereotype.Service;

@Service
public class MainServiceImpl implements MainService {

    private static Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    DataSources qvuds;

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

        if (auth != null) {
            QvuAuthenticationService authService = config.getSecurityConfig().getAuthenticatorService();
            if (authService != null) {
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
                UserInformation u = authService.getUserInformation(auth.getName());

                if (u != null) {
                    retval.setCurrentUser(u);
                }
            } else if (config.getSecurityConfig().isBasic()) {
                retval.setCurrentUser(config.getSecurityConfig().getBasicConfiguration().findUser(auth.getName()));
                retval.getAllRoles().addAll(Constants.PREDEFINED_ROLES);
                retval.setAllRoles(config.getSecurityConfig().getBasicConfiguration().getRoles());
                retval.setAllUsers(config.getSecurityConfig().getBasicConfiguration().getUsers());
                retval.setAllowUserRoleEdit(true);
            } else {
                UserInformation u = new UserInformation();
                u.setUserId(auth.getName());
                for (GrantedAuthority ga : auth.getAuthorities()) {
                    u.getRoles().add(ga.getAuthority());
                }
                retval.setCurrentUser(u);
            }

            if (retval.getCurrentUser() != null) {
                if (auth.getPrincipal() instanceof Saml2AuthenticatedPrincipal) {
                    loadUserAttributes(retval.getCurrentUser(), ((Saml2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes(), config.getSecurityConfig().getRoleAttributeName());
                } else if (auth.getPrincipal() instanceof OAuth2AuthenticatedPrincipal) {
                    loadUserAttributes(retval.getCurrentUser(), ((OAuth2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes(), config.getSecurityConfig().getRoleAttributeName());
                }
            }

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

    private void loadUserAttributes(UserInformation user, Map attributes, String roleAttributeName) {
        for (Object o : attributes.keySet()) {
            Object val = attributes.get(o);
            if (val != null) {
                String att = o.toString();
                if (val instanceof Collection) {
                    int indx = 0;
                    for (Object o2 : (Collection) val) {
                        String val2 = o2.toString();
                        if (roleAttributeName.equalsIgnoreCase(att)) {
                            user.getRoles().add(val2);
                        } else {
                            if (indx == 0) {
                                user.getAttributes().add(new UserAttribute(att, val2));
                            } else {
                                user.getAttributes().add(new UserAttribute(att + indx, val2));
                            }

                            indx++;
                        }
                    }
                } else {
                    user.getAttributes().add(new UserAttribute(att, val.toString()));
                }
            }
        }

        for (UserAttribute ua : user.getAttributes()) {
            LOG.error("---->at=" + ua.getName() + "=" + ua.getValue());
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
