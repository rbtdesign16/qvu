package org.rbtdesign.qvu.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.User;

/**
 *
 * @author rbtuc
 */
public class AuthData implements Serializable {
    private List<Role> allRoles = new ArrayList<>();
    private List<User> allUsers = new ArrayList<>();
    private User currentUser;
    private String securityType;
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

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }
    
    
}
