/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.RoleInformation;
import org.rbt.qvu.client.utils.UserInformation;

/**
 *
 * @author rbtuc
 */
public class BasicConfiguration {
    private String authenticatorServiceClassName;
    private List<UserInformation> users = new ArrayList<>();
    private List<RoleInformation> roles = new ArrayList<>();

    public String getAuthenticatorServiceClassName() {
        return authenticatorServiceClassName;
    }

    public void setAuthenticatorServiceClassName(String authenticatorServiceClassName) {
        this.authenticatorServiceClassName = authenticatorServiceClassName;
    }

    public List<UserInformation> getUsers() {
        return users;
    }

    public void setUsers(List<UserInformation> users) {
        this.users = users;
    }

    public List<RoleInformation> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleInformation> roles) {
        this.roles = roles;
    }
    
    
    
}
