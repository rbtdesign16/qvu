/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;

/**
 *
 * @author rbtuc
 */
public class AuthData implements Serializable {
    private List<Role> allRoles = new ArrayList<>();
    private List<User> allUsers = new ArrayList<>();
    private User currentUser;
    private boolean allowUserAdd;
    private boolean allowUserDelete;
    private boolean initializingApplication;

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

    public boolean isAllowUserAdd() {
        return allowUserAdd;
    }

    public void setAllowUserAdd(boolean allowUserAdd) {
        this.allowUserAdd = allowUserAdd;
    }

    public boolean isAllowUserDelete() {
        return allowUserDelete;
    }

    public void setAllowUserDelete(boolean allowUserDelete) {
        this.allowUserDelete = allowUserDelete;
    }

    public boolean isInitializingApplication() {
        return initializingApplication;
    }

    public void setInitializingApplication(boolean initializingApplication) {
        this.initializingApplication = initializingApplication;
    }
    
    
}
