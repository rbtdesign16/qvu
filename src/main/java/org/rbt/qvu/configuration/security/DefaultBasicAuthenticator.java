/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.client.utils.AuthenticationException;
import org.rbt.qvu.client.utils.RoleInformation;
import org.rbt.qvu.client.utils.SaveException;
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
        ui.setFirstName("John");
        ui.setLastName("Doe");
        ui.getAttributes().add(new UserAttribute(Constants.PASSWORD_ATTRIBUTE_NAME, "admin"));
    //    ui.getRoles().addAll(Arrays.asList(Constants.DEFAULT_ROLE_NAMES));
        
        retval.add(ui);
                
        ui = new UserInformation();
        ui.setUserId("tester");
        ui.setFirstName("Joe");
        ui.setLastName("Blow");
        ui.getAttributes().add(new UserAttribute(Constants.PASSWORD_ATTRIBUTE_NAME, "test"));
   //     ui.getRoles().add("user");
   //     ui.getRoles().add("report designer");
        
        retval.add(ui);
        
        return retval;
    }

    @Override
    public List<RoleInformation> getAllRoles() {
        return Constants.DEFAULT_ROLES;
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

    @Override
    public int saveUser(UserInformation user)  throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public int saveRole(RoleInformation role)  throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public int deleteUser(String userId) throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public int deleteRole(String roleName) throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
}
