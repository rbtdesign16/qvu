/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.Comparator;
import org.rbt.qvu.client.utils.Role;

/**
 *
 * @author rbtuc
 */
public class RoleComparator implements Comparator<Role> {

    @Override
    public int compare(Role o1, Role o2) {
        return o1.getName().compareTo(o2.getName());
    }
    
}
