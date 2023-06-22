/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.client.utils.AuthenticationException;
import org.rbt.qvu.client.utils.UserAttribute;
import org.rbt.qvu.configuration.database.DataSources;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class DefaultBasicAuthenticator implements QvuAuthenticationService {
    private static Logger LOG = LoggerFactory.getLogger(DataSources.class);
    private static final String[] ROLES = {
        "administrator", 
        "query designer", 
        "report designer",
        "user"};
    private static final String ADMIN = "admin";
    private static final String USER = "user";

    @Override
    public boolean authenticate(String user, String pass) throws AuthenticationException  {
        boolean retval = false;

        if ((ADMIN.equalsIgnoreCase(user) && ADMIN.equals(pass))
                || (USER.equalsIgnoreCase(user) && USER.equals(pass))) {
            retval = true;
        }
        
        LOG.debug("in authenticate: user=" + user + ", retval=" + retval);
        return retval;
    }

    @Override
    public UserInformation getUserInformation(String userId) {
        return findUser(userId);
    }

    @Override
    public List<UserInformation> getAllUsers() {
        List<UserInformation> retval = new ArrayList<>();
        UserInformation ui = new UserInformation();
        ui.setUserId("admin");
        ui.getAttributes().add(new UserAttribute(Constants.PASSWORD_ATTRIBUTE_NAME, "admin"));
        ui.getRoles().addAll(Arrays.asList(ROLES));
        
        retval.add(ui);
                
        ui = new UserInformation();
        ui.setUserId("user");
        ui.getAttributes().add(new UserAttribute(Constants.PASSWORD_ATTRIBUTE_NAME, "user"));
        ui.getRoles().add("user");
        ui.getRoles().add("report designer");
        
        retval.add(ui);
        
        return retval;
    }

    @Override
    public List<String> getAllRoles() {
        return Arrays.asList(ROLES);
    }

    private UserInformation findUser(String userId) {
        UserInformation retval = null;
        List<UserInformation> users = getAllUsers();
        for (UserInformation u : users) {
            if (userId.equalsIgnoreCase(u.getUserId())) {
                retval = u;
                break;
            }
        }
        return retval;
    }
}
