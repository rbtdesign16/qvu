package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportComponent {
    private Rect position = new Rect();
    private String location = Constants.REPORT_LOCATION_BODY;
    private String type = Constants.REPORT_OBJECT_TYPE_TEXT;
    private String font = Constants.DEFAULT_FONT;
    private String fontColor = Constants.DEFAULT_FONT_COLOR;
    private int fontSize = Constants.DEFAULT_FONT_SIZE;
    private boolean fontBold = false;
    private boolean fontItalix = false;
    private boolean fontUnderline = false;
    private double left = Constants.DEFAULT_COMPONENT_LEFT;
    private double top = Constants.DEFAULT_COMPONENT_TOP;
    private double width = Constants.DEFAULT_COMPONENT_WIDTH;
    private double height = Constants.DEFAULT_COMPONENT_HEIGHT;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public Rect getPosition() {
        return position;
    }

    public void setPosition(Rect position) {
        this.position = position;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFont() {
        return font;
    }

    public void setFont(String font) {
        this.font = font;
    }

    public int getFontSize() {
        return fontSize;
    }

    public void setFontSize(int fontSize) {
        this.fontSize = fontSize;
    }

    public boolean isFontBold() {
        return fontBold;
    }

    public void setFontBold(boolean fontBold) {
        this.fontBold = fontBold;
    }

    public boolean isFontItalix() {
        return fontItalix;
    }

    public void setFontItalix(boolean fontItalix) {
        this.fontItalix = fontItalix;
    }

    public boolean isFontUnderline() {
        return fontUnderline;
    }

    public void setFontUnderline(boolean fontUnderline) {
        this.fontUnderline = fontUnderline;
    }

    public String getFontColor() {
        return fontColor;
    }

    public void setFontColor(String fontColor) {
        this.fontColor = fontColor;
    }
 }
