/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.services.MainServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

/**
 *
 * @author rbtuc
 */
public class AuthHelper {
    private static Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    public static boolean isFirstNameAttribute(String att) {
        boolean retval = false;

        if (StringUtils.isNotEmpty(att)) {
            retval = Constants.FIRST_NAME_ATTRIBUTES.contains(att.toLowerCase());
        }

        return retval;
    }

    public static boolean isLastNameAttribute(String att) {
        boolean retval = false;

        if (StringUtils.isNotEmpty(att)) {
            retval = Constants.LAST_NAME_ATTRIBUTES.contains(att.toLowerCase());
        }

        return retval;
    }


    public static boolean isRealmAccess(String att) {
        boolean retval = false;

        if (StringUtils.isNotEmpty(att)) {
            retval = Constants.OAUTH2_CLAIM_ATTRIBUTE_REAL_ACCESS.equalsIgnoreCase(att.toLowerCase());
        }

        return retval;
    }
    
    public static boolean isRoleAttribute(SecurityConfiguration config, String att) {
        boolean retval = false;

        if (StringUtils.isNotEmpty(att)) {
            retval = (att.toLowerCase().startsWith(Constants.ROLE_PREFIX)
                    || att.equalsIgnoreCase(config.getRoleAttributeName()));
        }

        return retval;
    }
    
    public static List<String> getRolesFromRealmAccess(String in) {
        List <String> retval = new ArrayList<>();
        
        if (LOG.isDebugEnabled()) {
            LOG.debug("realm_access=" + in);
        }
        
        if (StringUtils.isNotEmpty(in)) {
            int rolesIndex = in.indexOf("roles=");
            if (rolesIndex > -1) {
                int pos = in.indexOf("[", rolesIndex);
                if (pos > -1) {
                    int pos2 = in.indexOf("]", pos);
            
                    if (pos < pos2) {
                        String roleString = in.substring(pos + 1, pos2);
                        if (LOG.isDebugEnabled()) {
                            LOG.debug("realm_accces roles=" + roleString);
                        }

                        StringTokenizer st = new StringTokenizer(roleString, ",");

                        while (st.hasMoreTokens()) {
                            retval.add(st.nextToken().trim());
                        }
                    }
                }
            }
         }
        
        return retval;
    }
    
    public static String formatRoleAttribute(String in) {
        String retval = in;
        
        if (StringUtils.isNotEmpty(in)) {
            if (in.toLowerCase().startsWith(Constants.ROLE_PREFIX)) {
                retval = in.substring(Constants.ROLE_PREFIX.length());
            }
        }
        
        return retval;
    }
    
    public static String formatAttributeName(String in) {
        String retval = in;
        if (StringUtils.isNotEmpty(in)) {
            if (Constants.SAML_FIRST_NAME_ATTRIBUTE_KEY.equals(in)) {
                retval = "first_name";
            } else if (Constants.SAML_LAST_NAME_ATTRIBUTE_KEY.equals(in)) {
                retval = "last_name";
            } 
        }
         return retval;
    }
    
    public static void removePasswords(AuthData auth) {
        User u = new User();
        BeanUtils.copyProperties(auth.getCurrentUser(), u, "password");
        auth.setCurrentUser(u);
        
        List<User> users = new ArrayList<>();
        for (User user : auth.getAllUsers()) {
            u = new User();
            BeanUtils.copyProperties(user, u, "password");
            users.add(u);
        }
        
        auth.setAllUsers(users);
    }

}
