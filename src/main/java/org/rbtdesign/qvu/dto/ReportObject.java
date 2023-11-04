package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportObject {
    private double width = 0;
    private double height = 0;
    private int location = Constants.REPORT_LOCATION_BODY;
    private int REPORT_OBJECT_TYPE = Constants.REPORT_OBJECT_TYPE_TEXT;

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

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
    
    
}
