package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportComponent {
    private String type = Constants.REPORT_COMPONENT_TYPE_TEXT;
    private double left = Constants.DEFAULT_REPORT_COMPONENT_LEFT;
    private double top = Constants.DEFAULT_REPORT_COMPONENT_TOP;
    private double width = Constants.DEFAULT_REPORT_COMPONENT_WIDTH;
    private double height = Constants.DEFAULT_REPORT_COMPONENT_HEIGHT;
    private String section = Constants.DEFAULT_REPORT_SECTION;
    private String align = Constants.DEFAULT_REPORT_COMPONENT_ALIGN;
    private FontSettings fontSettings;
    private BorderSettings borderSettings;
    private String foregroundColor = Constants.DEFAULT_REPORT_COMPONENT_FOREGROUND_COLOR;
    private String backgroundColor = Constants.DEFAULT_REPORT_COMPONENT_BACKGROUND_COLOR;
    private Object value;
    private int zindex = 0;
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getLeft() {
        return left;
    }

    public void setLeft(double left) {
        this.left = left;
    }

    public double getTop() {
        return top;
    }

    public void setTop(double top) {
        this.top = top;
    }

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

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public FontSettings getFontSettings() {
        return fontSettings;
    }

    public void setFontSettings(FontSettings fontSettings) {
        this.fontSettings = fontSettings;
    }

    public String getAlign() {
        return align;
    }

    public void setAlign(String align) {
        this.align = align;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public int getZindex() {
        return zindex;
    }

    public void setZindex(int zindex) {
        this.zindex = zindex;
    }

    public String getForegroundColor() {
        return foregroundColor;
    }

    public void setForegroundColor(String foregroundColor) {
        this.foregroundColor = foregroundColor;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public BorderSettings getBorderSettings() {
        return borderSettings;
    }

    public void setBorderSettings(BorderSettings borderSettings) {
        this.borderSettings = borderSettings;
    }
    
    
 }
