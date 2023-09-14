package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.Role;

/**
 *
 * @author rbtuc
 */
public class RoleComparator implements Comparator<Role> {

    @Override
    public int compare(Role o1, Role o2) {
        if (StringUtils.isEmpty(o1.getName()) && StringUtils.isEmpty(o2.getName())) {
            return 0;
        } else if (StringUtils.isEmpty(o1.getName())) {
            return 1;
        } else if (StringUtils.isEmpty(o2.getName())) {
            return -1;
        } else {
            return o1.getName().compareTo(o2.getName());
        }
    }
}
