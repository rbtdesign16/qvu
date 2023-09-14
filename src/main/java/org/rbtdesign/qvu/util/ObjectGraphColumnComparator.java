package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.rbtdesign.qvu.dto.SqlSelectColumn;

/**
 *
 * @author rbtuc
 */
public class ObjectGraphColumnComparator implements Comparator<SqlSelectColumn> {

    @Override
    public int compare(SqlSelectColumn o1, SqlSelectColumn o2) {
        int retval = o1.getTableAlias().compareTo(o2.getTableAlias());
        
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
