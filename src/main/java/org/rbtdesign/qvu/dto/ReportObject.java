package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportObject {
    private Rect position = new Rect();
    private int location = Constants.REPORT_LOCATION_BODY;
    private int REPORT_OBJECT_TYPE = Constants.REPORT_OBJECT_TYPE_TEXT;

    public int getLocation() {
        return location;
    }

    public void setLocation(int location) {
        this.location = location;
    }

    public int getREPORT_OBJECT_TYPE() {
        return REPORT_OBJECT_TYPE;
    }

    public void setREPORT_OBJECT_TYPE(int REPORT_OBJECT_TYPE) {
        this.REPORT_OBJECT_TYPE = REPORT_OBJECT_TYPE;
    }

    public Rect getPosition() {
        return position;
    }

    public void setPosition(Rect position) {
        this.position = position;
    }
    
    
}
