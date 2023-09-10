/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.util;

import java.util.Comparator;
import org.apache.commons.lang3.StringUtils;
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
        } else if (StringUtils.isEmpty(o1.getName()) && StringUtils.isEmpty(o2.getName())) {
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
