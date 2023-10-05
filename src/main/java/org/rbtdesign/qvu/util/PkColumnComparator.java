package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.rbtdesign.qvu.dto.SqlSelectColumn;

/**
 *
 * @author rbtuc
 */
public class PkColumnComparator implements Comparator<SqlSelectColumn> {

    @Override
    public int compare(SqlSelectColumn o1, SqlSelectColumn o2) {
        Integer a1 = Integer.valueOf(o1.getTableAlias().replace("t", ""));
        Integer a2 = Integer.valueOf(o2.getTableAlias().replace("t", ""));

        int retval = a1.compareTo(a2);
        if (retval == 0) {
            if ((o1.getPkIndex() > 0) && (o2.getPkIndex() <= 0)) {
                retval = -1;
            } else if ((o2.getPkIndex() > 0) && (o1.getPkIndex() <= 0)) {
                retval = 1;
            } else if ((o2.getPkIndex() > 0) && (o1.getPkIndex() > 0)) {
                retval = o1.getPkIndex().compareTo(o2.getPkIndex());
            } else {
                retval = o1.getColumnName().compareTo(o2.getColumnName());
            }
        }
        
        return retval;

    }
}
