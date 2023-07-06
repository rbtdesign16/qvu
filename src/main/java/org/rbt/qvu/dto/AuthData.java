/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;

/**
 *
 * @author rbtuc
 */
public class AuthData {
    private String administratorRole;
    private String queryDesignerRole;
    private String reportDesignerRole;
    private List<Role> allRoles = new ArrayList<>();
    private List<User> allUsers = new ArrayList<>();
    private User currentUser;
    private boolean allowUserRoleEdit;
    private boolean initialSetupRequired;

    public List<Role> getAllRoles() {
        return allRoles;
    }

    public void setAllRoles(List<Role> allRoles) {
        this.allRoles = allRoles;
    }

    public List<User> getAllUsers() {
        return allUsers;
    }

    public void setAllUsers(List<User> allUsers) {
        this.allUsers = allUsers;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public void setCurrentUser(User currentUser) {
        this.currentUser = currentUser;
    }

    public boolean isAllowUserRoleEdit() {
        return allowUserRoleEdit;
    }

    public void setAllowUserRoleEdit(boolean allowUserRoleEdit) {
        this.allowUserRoleEdit = allowUserRoleEdit;
    }

    public String getAdministratorRole() {
        return administratorRole;
    }

    public void setAdministratorRole(String administratorRole) {
        this.administratorRole = administratorRole;
    }

    public String getQueryDesignerRole() {
        return queryDesignerRole;
    }

    public void setQueryDesignerRole(String queryDesignerRole) {
        this.queryDesignerRole = queryDesignerRole;
    }

    public String getReportDesignerRole() {
        return reportDesignerRole;
    }

    public void setReportDesignerRole(String reportDesignerRole) {
        this.reportDesignerRole = reportDesignerRole;
    }

    public boolean isInitialSetupRequired() {
        return initialSetupRequired;
    }

    public void setInitialSetupRequired(boolean initialSetupRequired) {
        this.initialSetupRequired = initialSetupRequired;
    }

    
}
