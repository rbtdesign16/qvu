package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.rbtdesign.qvu.dto.DocumentGroup;

/**
 *
 * @author rbtuc
 */
public class DocumentGroupComparator implements Comparator<DocumentGroup> {

    @Override
    public int compare(DocumentGroup o1, DocumentGroup o2) {
        if (o1.isDefaultGroup()) {
            return -1;
        } else if (o2.isDefaultGroup()) {
            return 1;
        } else {
            return o1.getName().compareTo(o2.getName());
        }
    }
}
