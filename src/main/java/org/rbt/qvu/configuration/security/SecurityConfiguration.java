/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.client.utils.SecurityService;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.util.RoleComparator;
import org.rbt.qvu.util.UserComparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class SecurityConfiguration {
    private static final Logger LOG = LoggerFactory.getLogger(SecurityConfiguration.class);
    private String authenticatorServiceClassName;
    private String securityType;
    private boolean allowServiceSave = false;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private Map<String, String> roleAliases = new HashMap<>();
    private List<Role> roles = new ArrayList<>();
    private List<User> users = new ArrayList<>();

    private long lastUpdated;

    
    public SamlConfiguration getSamlConfiguration() {
        return samlConfiguration;
    }

    public void setSamlConfiguration(SamlConfiguration samlConfiguration) {
        this.samlConfiguration = samlConfiguration;
    }

    public OidcConfiguration getOidcConfiguration() {
        return oidcConfiguration;
    }

    public void setOidcConfiguration(OidcConfiguration oidcConfiguration) {
        this.oidcConfiguration = oidcConfiguration;
    }

    public String getAuthenticatorServiceClassName() {
        return authenticatorServiceClassName;
    }

    public void setAuthenticatorServiceClassName(String authenticatorServiceClassName) {
        this.authenticatorServiceClassName = authenticatorServiceClassName;
    }
    
    public SecurityService getAuthenticatorService() throws Exception {
        SecurityService retval = null;
        if (StringUtils.isNotEmpty(authenticatorServiceClassName)) {
            Class c = Class.forName(authenticatorServiceClassName);
            if (SecurityService.class.isAssignableFrom(c)) {
                retval = (SecurityService)c.getDeclaredConstructor().newInstance();
            }
        }
        return retval;
    }
    
    public boolean canAddUsersAndRoles() {
        return (isBasic() || isAllowServiceSave());
    }

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }
    
    public boolean isBasic() {
        return Constants.BASIC_SECURITY_TYPE.equals(this.securityType);
    }

    public boolean isAllowServiceSave() {
        return StringUtils.isNotEmpty(this.authenticatorServiceClassName) && allowServiceSave;
    }

    public void setAllowServiceSave(boolean allowServiceSave) {
        this.allowServiceSave = allowServiceSave;
    }

    public void postConstruct() {
        LOG.debug("in SecurityConfiguration.postConstruct()");
        Collections.sort(this.roles, new RoleComparator());
        Collections.sort(this.users, new UserComparator());
    }
   
    public String getRoleAlias(String role) {
        return roleAliases.get(role);
    }

    public Map<String, String> getRoleAliases() {
        return roleAliases;
    }

    public void setRoleAliases(Map<String, String> roleAliases) {
        this.roleAliases = roleAliases;
    }

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public boolean isBasicConfig() {
        return Constants.BASIC_SECURITY_TYPE.equals(securityType);
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
        Collections.sort(this.roles, new RoleComparator());
    }

    public Role findRoleName(String name) {
        Role retval = null;
        Role r = new Role();
        r.setName(name);
        int indx = Collections.binarySearch(roles, r, new RoleComparator());

        if (indx > -1) {
            retval = roles.get(indx);
        }

        return retval;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public User findUser(String userId) {
        User retval = null;
        User u = new User();
        u.setUserId(userId);
        int indx = Collections.binarySearch(users, u, new UserComparator());

        if (indx > -1) {
            retval = users.get(indx);
        }

        return retval;
    }
}
