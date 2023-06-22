/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.SecurityConfig;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.client.utils.UserAttribute;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
public class BasicAuthSecurityProvider implements AuthenticationProvider {

    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private Config config;
    
    private String authenticatorClass;

    private Map<String, UserInformation> userMap = new HashMap<>();

    @PostConstruct
    private void init() {
        LOG.info("in BasicAuthSecurityProvider.init()");
        try {
            SecurityConfiguration securityConfig = config.getSecurityConfig();
            authenticatorClass = securityConfig.getBasicConfiguration().getAuthenticatorServiceClassName();
            LOG.info("authenticatorClass=" + authenticatorClass);

            // if no authenticator service then load from config file
            if (securityConfig.getAuthenticatorService() == null) {
                Set<String> predefinedRoles = new HashSet<>(Arrays.asList(SecurityConfiguration.PREDEFINED_ROLES));
                for (UserInformation uinfo : securityConfig.getBasicConfiguration().getUsers()) {
                    Iterator <String> it = uinfo.getRoles().iterator();
                    while (it.hasNext()) {
                        // remove duplicates when loading external roles
                        if (predefinedRoles.contains(it.next().toLowerCase())) {
                            it.remove();
                        }
                    }
                    userMap.put(uinfo.getUserId(), uinfo);
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {
        Authentication retval = null;
        try {
            String name = authentication.getName();
            String password = authentication.getCredentials().toString();

            if (StringUtils.isEmpty(name) || StringUtils.isEmpty(password)) {
                throw new Exception("usename and password required");
            }

            
            QvuAuthenticationService service = config.getSecurityConfig().getAuthenticatorService();
            if (service != null) {
                retval = authenticateWithClass(service, name, password);
            } else {
                retval = authenticateFromProperties(name, password);
            }

            LOG.debug("user " + name + " authenticated=" + retval.isAuthenticated());
        } catch (Exception ex) {
            throw new AuthenticationServiceException(ex.toString());
        }

        return retval;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return true;
    }

    private Authentication authenticateWithClass(QvuAuthenticationService service, String name, String password) throws Exception {
        Authentication retval = null;
        if (service.authenticate(name, password)) {
            UserInformation uinfo = service.getUserInformation(name);
            retval = new UsernamePasswordAuthenticationToken(name, password, toGrantedAuthority(uinfo.getRoles()));
        }

        return retval;
    }

    private String getUserPassword(List<UserAttribute> attributes) {
        String retval = null;

        if (attributes != null) {
            for (UserAttribute attr : attributes) {
                if (Constants.PASSWORD_ATTRIBUTE_NAME.equalsIgnoreCase(attr.getName())) {
                    retval = attr.getValue();
                    break;
                }
            }
        }

        return retval;
    }

    private Authentication authenticateFromProperties(String name, String password) throws Exception {
        LOG.debug("in authenticateFromProperties");
        Authentication retval = null;
        UserInformation uinfo = userMap.get(name);

        if (password.trim().equals(getUserPassword(uinfo.getAttributes()))) {
            List<SimpleGrantedAuthority> gal = new ArrayList<>();
            List<String> roles = uinfo.getRoles();
            if (roles != null) {
                gal.addAll(toGrantedAuthority(roles));
            }

            retval = new UsernamePasswordAuthenticationToken(name, password, gal);
        }
        return retval;
    }

    private List<SimpleGrantedAuthority> toGrantedAuthority(List<String> in) {
        List<SimpleGrantedAuthority> retval = new ArrayList<>();

        if (in != null) {
            for (String s : in) {
                retval.add(new SimpleGrantedAuthority(s));

            }
        }

        return retval;
    }
}
