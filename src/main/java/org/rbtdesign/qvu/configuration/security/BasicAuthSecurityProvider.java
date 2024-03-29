package org.rbtdesign.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.User;
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
import org.rbtdesign.qvu.client.utils.SecurityService;
import org.rbtdesign.qvu.util.AuthHelper;
import org.rbtdesign.qvu.util.RoleComparator;
import org.rbtdesign.qvu.util.UserComparator;

/**
 *
 * @author rbtuc
 */
@Component
public class BasicAuthSecurityProvider implements AuthenticationProvider {
    private static Logger LOG = LoggerFactory.getLogger(BasicAuthSecurityProvider.class);

    @Autowired
    private ConfigurationHelper config;
    private List<Role> roles = new ArrayList<>();
    private List<User> users = new ArrayList<>();

    @PostConstruct
    private void init() {
        LOG.info("in BasicAuthSecurityProvider.init()");
        try {
            SecurityConfiguration securityConfig = config.getSecurityConfig();
            BasicConfiguration basicConfig = securityConfig.getBasicConfiguration();
            
            // if no authenticator service then load from config file
            if (basicConfig.getSecurityService() != null) {
                users = basicConfig.getSecurityService().getAllUsers();
                roles = basicConfig.getSecurityService().getAllRoles();
            } else {
                roles = securityConfig.getRoles();
                users = securityConfig.getUsers();
            }

            Collections.sort(users, new UserComparator());
            Collections.sort(roles, new RoleComparator());
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

            BasicConfiguration basicConfig = config.getSecurityConfig().getBasicConfiguration();
            if (basicConfig.getSecurityService() != null) {
                retval = authenticateWithClass(basicConfig.getSecurityService(), name, password);
            } else {
                retval = authenticateFromProperties(name, password);
            }
            
            LOG.debug("user " + name + " authenticated=" + ((retval != null) && retval.isAuthenticated()));
        } catch (Exception ex) {
            throw new AuthenticationServiceException(ex.toString(), ex);
        }

        return retval;
    }

    @Override
    public boolean supports(Class<? extends Object> authentication) {
        return true;
    }

    private Authentication authenticateWithClass(SecurityService service, String name, String password) throws Exception {
        Authentication retval = null;
        if (service.authenticate(name, password)) {
            User uinfo = service.getUser(name);
            if (uinfo != null) {
                retval = new UsernamePasswordAuthenticationToken(uinfo, password, toGrantedAuthority(uinfo.getRoles()));
            }
        }

        return retval;
    }

    private Authentication authenticateFromProperties(String name, String password) throws Exception {
        LOG.debug("in authenticateFromProperties");
        Authentication retval = null;

        User uinfo = config.getSecurityConfig().findUser(name);
        if (uinfo != null) {
            String storedPassword = uinfo.getPassword();
            if (StringUtils.isNotEmpty(password) && StringUtils.isNotEmpty(storedPassword)) {
                // passwords are stored as md5 hashed strings
                String hashedPassword = AuthHelper.toMd5Hash(password);
                if (storedPassword.equals(hashedPassword)) {
                    retval = new UsernamePasswordAuthenticationToken(uinfo, password, toGrantedAuthority(uinfo.getRoles()));
                }
            }
        }

        return retval;
    }

    private List<SimpleGrantedAuthority> toGrantedAuthority(Collection<String> in) {
        List<SimpleGrantedAuthority> retval = new ArrayList<>();

        if (in != null) {
            for (String s : in) {
                retval.add(new SimpleGrantedAuthority(s));
            }
        }

        return retval;
    }

}
