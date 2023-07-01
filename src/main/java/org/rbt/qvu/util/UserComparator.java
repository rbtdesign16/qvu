/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.Comparator;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.User;

/**
 *
 * @author rbtuc
 */
public class UserComparator implements Comparator<User> {

    @Override
    public int compare(User o1, User o2) {
        if (StringUtils.isEmpty(o1.getUserId()) && StringUtils.isEmpty(o2.getUserId())) {
            return 0;
        } else if (StringUtils.isEmpty(o1.getUserId())) {
            return 1;
        } else if (StringUtils.isEmpty(o2.getUserId())) {
            return -1;
        } else {
            return o1.getUserId().compareTo(o2.getUserId());
        }
    }
    
}
