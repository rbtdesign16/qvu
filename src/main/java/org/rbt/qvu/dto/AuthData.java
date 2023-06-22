/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.UserInformation;

/**
 *
 * @author rbtuc
 */
public class AuthData {
    private List<String> allRoles = new ArrayList<>();
    private List<UserInformation> allUsers = new ArrayList<>();
    private UserInformation currentUser;

    public List<String> getAllRoles() {
        return allRoles;
    }

    public void setAllRoles(List<String> allRoles) {
        this.allRoles = allRoles;
    }

    public List<UserInformation> getAllUsers() {
        return allUsers;
    }

    public void setAllUsers(List<UserInformation> allUsers) {
        this.allUsers = allUsers;
    }

    public UserInformation getCurrentUser() {
        return currentUser;
    }

    public void setCurrentUser(UserInformation currentUser) {
        this.currentUser = currentUser;
    }
    
    
}