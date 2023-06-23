package org.rbt.qvu.services;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.client.utils.UserAttribute;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.AuthData;
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

    private Set<String> predefinedRoles = new HashSet<>();

    @PostConstruct
    private void init() {
        LOG.info("in MainServiceImpl.init()");
        
        // load up a set for predfined roles to check
        // for duplicates when loading external roles
        predefinedRoles.addAll(Arrays.asList(SecurityConfiguration.PREDEFINED_ROLES));
    }

    @Override
    public String getDatabaseInfo(String dsname) {
        return qvuds.getDatabaseInfo(dsname);
    }

    @Override
    public List<String> getAllDatabaseInfo() {
        return qvuds.getAllDatabaseInfo();
    }

    @Override
    public AuthData loadAuthData() throws Exception {
        AuthData retval = new AuthData();

        UserInformation user = new UserInformation();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        user.setUserId(auth.getName());
        for (GrantedAuthority ga : auth.getAuthorities()) {
            String role = ga.getAuthority();
            
            if (!predefinedRoles.contains(role.toLowerCase())) {
                user.getRoles().add(ga.getAuthority());
            }
        }

        if (auth.getPrincipal() instanceof Saml2AuthenticatedPrincipal) {
            loadUserAttributes(user, ((Saml2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
        } else if (auth.getPrincipal() instanceof OAuth2AuthenticatedPrincipal) {
            loadUserAttributes(user, ((OAuth2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
        }

        QvuAuthenticationService authService = config.getSecurityConfig().getAuthenticatorService();

        retval.setCurrentUser(user);
        if (authService != null) {
            retval.getAllRoles().addAll(authService.getAllRoles());
            retval.getAllUsers().addAll(authService.getAllUsers());
            UserInformation u = authService.getUserInformation(auth.getName());

            if (u != null) {
                retval.setCurrentUser(u);
            }
        } else if (config.getSecurityConfig().isBasic()) {
            retval.setCurrentUser(user);
            retval.setAllRoles(config.getSecurityConfig().getBasicConfiguration().getRoles());
            retval.setAllUsers(config.getSecurityConfig().getBasicConfiguration().getUsers());
        }
        
        retval.setCanCreateUsersAndRoles(config.getSecurityConfig().canAddUsersAndRoles());

        if (LOG.isDebugEnabled()) {
            LOG.debug("AuthData: " + gson.toJson(retval, AuthData.class));
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
        Set<String> hs = new HashSet<>();
        for (Object o : attributes.keySet()) {
            Object val = attributes.get(o);
            if (val != null) {
                String att = o.toString();
                if (val instanceof Collection) {
                    int indx = 0;
                    for (Object o2 : (Collection) val) {
                        String val2 = o2.toString();
                        if (indx == 0) {
                            user.getAttributes().add(new UserAttribute(att, val2));
                        } else {
                            user.getAttributes().add(new UserAttribute(att + indx, val2));
                        }
                    }
                } else {
                    user.getAttributes().add(new UserAttribute(att, val.toString()));
                }
            }
        }
    }
}
