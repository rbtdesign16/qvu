package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.rbtdesign.qvu.dto.DocumentSchedule;

/**
 *
 * @author rbtuc
 */
public class DocumentScheduleComparator implements Comparator<DocumentSchedule> {

    @Override
    public int compare(DocumentSchedule o1, DocumentSchedule o2) {
        int retval = o1.getDocumentGroup().compareTo(o2.getDocumentGroup());
        
        if (retval == 0) {
            retval = o1.getDocumentName().compareTo(o2.getDocumentName());
        }
        
        return retval;
    }
}
