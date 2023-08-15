/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.client.utils.AuthenticationException;
import org.rbt.qvu.client.utils.DeleteException;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.SaveException;
import org.rbt.qvu.configuration.database.DataSources;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.rbt.qvu.client.utils.SecurityService;

/**
 *
 * @author rbtuc
 */
public class DefaultBasicAuthenticator implements SecurityService {
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
    public User getUser(String userId) {
        return findUser(userId);
    }

    @Override
    public List<User> getAllUsers() {
        List<User> retval = new ArrayList<>();
        User ui = new User();
        ui.setUserId("admin");
        ui.setFirstName("John");
        ui.setLastName("Doe");
        ui.setPassword("F6FDFFE48C908DEB0F4C3BD36C032E72");
        ui.getRoles().addAll(Arrays.asList(Constants.DEFAULT_ROLE_NAMES));
        
        retval.add(ui);
                
        ui = new User();
        ui.setUserId("user");
        ui.setFirstName("Joe");
        ui.setLastName("Blow");
        ui.setPassword("5CC32E366C87C4CB49E4309B75F57D64");
        ui.getRoles().add(Constants.DEFAULT_USER_ROLE);
        ui.getRoles().add(Constants.DEFAULT_QUERY_DESIGNER_ROLE);
        ui.getRoles().add(Constants.DEFAULT_REPORT_DESIGNER_ROLE);
        
        retval.add(ui);
        
        return retval;
    }

    @Override
    public List<Role> getAllRoles() {
        return Constants.DEFAULT_ROLES;
    }

    private User findUser(String userId) {
        User retval = null;
        List<User> users = getAllUsers();
        for (User u : users) {
            if (userId.equalsIgnoreCase(u.getUserId())) {
                retval = u;
                break;
            }
        }
        return retval;
    }

    @Override
    public OperationResult saveUser(User user)  throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public OperationResult saveRole(Role role)  throws SaveException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public OperationResult deleteUser(String userId) throws DeleteException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    @Override
    public OperationResult deleteRole(String roleName) throws DeleteException {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
}
