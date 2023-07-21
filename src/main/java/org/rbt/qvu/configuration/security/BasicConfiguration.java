/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.util.UserComparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class BasicConfiguration {
    private static Logger LOG = LoggerFactory.getLogger(BasicConfiguration.class);
    private String adminPassword;
    private boolean fileBasedSecurity = false;

    public boolean isFileBasedSecurity() {
        return fileBasedSecurity;
    }

    public void setFileBasedSecurity(boolean fileBasedSecurity) {
        this.fileBasedSecurity = fileBasedSecurity;
    }

    private List<User> users = new ArrayList<>();

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
        Collections.sort(this.users, new UserComparator());
    }

    public User findUser(String userId) {
        User retval = null;
        User u = new User();
        u.setUserId(userId);
        int indx = Collections.binarySearch(users, u, new UserComparator());

        if (indx > -1) {
            retval = users.get(indx);
        }

        return retval;
    }

    public void postConstruct() {
        LOG.debug("in BasicConfiguration.postConstruct()");
        Collections.sort(this.users, new UserComparator());
    }

}
