/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;

/**
 *
 * @author rbtuc
 */
public class BasicConfiguration {
    private String authenticatorServiceClassName;
    private List<User> users = new ArrayList<>();
    private List<Role> roles = new ArrayList<>();

    public String getAuthenticatorServiceClassName() {
        return authenticatorServiceClassName;
    }

    public void setAuthenticatorServiceClassName(String authenticatorServiceClassName) {
        this.authenticatorServiceClassName = authenticatorServiceClassName;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }
    
    public User findUser(String userId) {
        User retval = null;
        
        if (StringUtils.isNotEmpty(userId)) {
            for (User u : users) {
                if (userId.equalsIgnoreCase(u.getUserId())) {
                    retval = u;
                    break;
                }
            }
        }
        
        return retval;
    }
    

    
}
