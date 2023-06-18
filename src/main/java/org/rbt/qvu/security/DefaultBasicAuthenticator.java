/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.security;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DefaultBasicAuthenticator {
    private static final String ADMIN = "admin";
    private static final String USER = "user";
    
    public List<String> authenticate(String user, String pass) {
        List<String> retval = null;
        
        if (ADMIN.equalsIgnoreCase(user) && ADMIN.equals(pass)) {
            retval = new ArrayList<>();
            retval.add(ADMIN);
            
        } else if (USER.equalsIgnoreCase(user) && USER.equals(pass)) {
            retval = new ArrayList<>();
            retval.add(ADMIN);
        }
        
        return retval;
    }
    
}
