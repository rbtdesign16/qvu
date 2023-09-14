package org.rbtdesign.qvu.util;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.client.utils.User;
import org.rbtdesign.qvu.dto.AuthData;
import org.rbtdesign.qvu.services.MainServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

/**
 *
 * @author rbtuc
 */
public class AuthHelper {
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

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
