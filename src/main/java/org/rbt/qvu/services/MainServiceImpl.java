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
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
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

        if ((auth != null) && StringUtils.isNotEmpty(auth.getName())) {
            String userName = auth.getName();
            if (auth.getPrincipal() instanceof DefaultOAuth2User) {
                DefaultOAuth2User oauser = (DefaultOAuth2User)auth.getPrincipal();
                if (StringUtils.isNotEmpty(oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME))) {
                    userName = oauser.getAttribute(oauser.getAttribute(StandardClaimNames.PREFERRED_USERNAME));
                    LOG.error("----->cerd=" + auth.getCredentials());
       //             AccessToken.Access access = accessToken.getRealmAccess();
 //Set<String> roles = access.getRoles();
                 }
            }
             QvuAuthenticationService authService = config.getSecurityConfig().getAuthenticatorService();

            retval.setAdministratorRole(config.getSecurityConfig().getAdministratorRole());
            retval.setQueryDesignerRole(config.getSecurityConfig().getQueryDesignerRole());
            retval.setReportDesignerRole(config.getSecurityConfig().getReportDesignerRole());
            retval.setUserRole(config.getSecurityConfig().getUserRole());
            
            // users and roles are defined via json
            if (config.getSecurityConfig().isFileBasedSecurity()) {
                retval.getAllRoles().addAll(Constants.PREDEFINED_ROLES);
                retval.setAllRoles(config.getSecurityConfig().getBasicConfiguration().getRoles());
            } else if (authService != null) { // if we have a service defined we will try to loaf from there
                retval.getAllRoles().addAll(authService.getAllRoles());
                retval.getAllUsers().addAll(authService.getAllUsers());
            }

            // if we have users loaded try to find user based
            // on incoming user id
            for (UserInformation u : retval.getAllUsers()) {
                if (userName.equalsIgnoreCase(u.getUserId())) {
                    retval.setCurrentUser(u);
                    break;
                }
            }

            if (retval.getCurrentUser() == null) {
                UserInformation user = new UserInformation();
                user.setUserId(userName);
                retval.setCurrentUser(user);
                
                // only allow users and roles to be edited if we are loading
                // from json file
                retval.setAllowUserRoleEdit(config.getSecurityConfig().isFileBasedSecurity());
                
                for (GrantedAuthority ga : auth.getAuthorities()) {
                    retval.getCurrentUser().getRoles().add(ga.getAuthority());
                }
            }

            if (retval.getCurrentUser() != null) {
                if (auth.getPrincipal() instanceof Saml2AuthenticatedPrincipal) {
                    loadUserAttributes(retval.getCurrentUser(), ((Saml2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
                } else if (auth.getPrincipal() instanceof OAuth2AuthenticatedPrincipal) {
                    loadUserAttributes(retval.getCurrentUser(), ((OAuth2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
                }
            }
            
            LOG.error("---->" + gson.toJson(retval.getCurrentUser(), UserInformation.class));

            if (LOG.isDebugEnabled()) {
             //   LOG.debug("AuthData: " + gson.toJson(retval, AuthData.class));
            }
        }

        return retval;
    }
    
    private boolean isRoleAttribute(String att) {
        boolean retval = false;
        
        if (StringUtils.isNotEmpty(att)) {
            retval = (att.toLowerCase().startsWith("role_") 
                 || att.equalsIgnoreCase(config.getSecurityConfig().getRoleAttributeName()));
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
                        if (isRoleAttribute(att)) {
                            LOG.error("------>" + att + "=" + val2);
                            if (val2.toLowerCase().startsWith("role_")) {
                                val2 = val2.substring(5);
                            } 
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
                    if (isRoleAttribute(att)) {
                        String val2 = val.toString();
                        LOG.error("------>" + att + "=" + val2);
                        if (val2.toLowerCase().startsWith("role_")) {
                            val2 = val2.substring(5);
                        } 
                        user.getRoles().add(val2);
                    } else {       
                        user.getAttributes().add(new UserAttribute(att, val.toString()));
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
