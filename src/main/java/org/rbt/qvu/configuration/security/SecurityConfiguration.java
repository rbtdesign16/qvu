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
import org.rbt.qvu.client.utils.Role;
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
    private BasicConfiguration basicConfiguration;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private List<Role> roles = new ArrayList<>();
    private List<User> users = new ArrayList<>();

    private long lastUpdated;

    public BasicConfiguration getBasicConfiguration() {
        return basicConfiguration;
    }

    public void setBasicConfiguration(BasicConfiguration basicConfiguration) {
        this.basicConfiguration = basicConfiguration;
    }

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

    public void postConstruct() {
        LOG.debug("in SecurityConfiguration.postConstruct()");
        Collections.sort(this.roles, new RoleComparator());
        Collections.sort(this.users, new UserComparator());
    }
   
    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
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
