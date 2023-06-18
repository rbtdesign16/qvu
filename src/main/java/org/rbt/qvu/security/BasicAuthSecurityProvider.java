/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.security;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.StringTokenizer;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.SecurityConfig;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
public class BasicAuthSecurityProvider implements AuthenticationProvider {

    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("#{environment.QVU_SECURITY_CONFIG_FILE}")
    private String securityConfigFile;

    private String authenticatorClass;

    private Map<String, String> userMap = new HashMap<>();
    private Map<String, List<String>> userRolesMap = new HashMap<>();

    @PostConstruct
    private void init() {
        LOG.info("in BasicAuthSecurityProvider.init()");
        Properties p = Helper.loadProperties(securityConfigFile);
        authenticatorClass = p.getProperty(Constants.BASIC_AUTHENTICATOR_CLASS_PROPERTY);
        LOG.info("authenticatorClass=" + authenticatorClass);

        if (StringUtils.isEmpty(authenticatorClass)) {
            loadUsers(p);
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

            if (StringUtils.isNotEmpty(authenticatorClass)) {
                retval = authenticateWithClass(authenticatorClass, name, password);
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

    private Authentication authenticateWithClass(String className, String name, String password) throws Exception {
        Authentication retval = null;
        Class c = Class.forName(className);
        Method m = c.getDeclaredMethod("authenticate", String.class, String.class);

        Class returnType = m.getReturnType();

        if (List.class.isAssignableFrom(returnType)) {
            Object o = c.getDeclaredConstructor().newInstance();
            List details = (List) m.invoke(o, name, password);

            if (details != null) {
                retval = new UsernamePasswordAuthenticationToken(name, password, toGrantedAuthority(details));
            }
        }

        return retval;
    }

    private Authentication authenticateFromProperties(String name, String password) throws Exception {
        Authentication retval = null;
        String pass = userMap.get(name);

        if (password.trim().equals(pass)) {
            List<String> roles = userRolesMap.get(name);
            
            List<SimpleGrantedAuthority> gal = new ArrayList<>();
            if (roles != null) {
                gal.addAll(toGrantedAuthority(roles));
            }
            
            retval = new UsernamePasswordAuthenticationToken(name, password,gal);
        }
        return retval;
    }

    private void loadUsers(Properties p) {
        String users = p.getProperty(Constants.BASIC_AUTH_USERS_PROPERTY);

        if (StringUtils.isNotEmpty(users)) {
            StringTokenizer st = new StringTokenizer(users, ",");

            while (st.hasMoreTokens()) {
                String[] creds = st.nextToken().split(":");
                userMap.put(creds[0], creds[1]);
                String roles = p.getProperty(Constants.BASIC_AUTH_USER_ROLES_PROPERTY.replace("$", creds[0]));
                if (StringUtils.isNotEmpty(roles)) {
                    userRolesMap.put(creds[0], Helper.commaDelimitedToList(roles));
                }
            }
        }
    }
    
    private List<SimpleGrantedAuthority> toGrantedAuthority(List <String> in) {
        List <SimpleGrantedAuthority> retval = new ArrayList<>();
        
        if (in != null) {
            for (String s : in) {
                retval.add(new SimpleGrantedAuthority(s));
               
            }
        }
        
        return retval;
    }
}
