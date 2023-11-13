package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class FontSettings {
    private String font = Constants.DEFAULT_REPORT_FONT;
    private String color = Constants.DEFAULT_REPORT_FONT_COLOR;
    private int size = Constants.DEFAULT_REPORT_FONT_SIZE;
    private boolean bold = false;
    private boolean italic = false;
    private boolean underline = false;

    public String getFont() {
        return font;
    }

    public void setFont(String font) {
        this.font = font;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int cize) {
        this.size = size;
    }

    public boolean isBold() {
        return bold;
    }

    public void setBold(boolean bold) {
        this.bold = bold;
    }

    public boolean isItalic() {
        return italic;
    }

    public void setItalic(boolean italic) {
        this.italic = italic;
    }

    public boolean isUnderline() {
        return underline;
    }

    public void setUnderline(boolean underline) {
        this.underline = underline;
    }
    
    
   
}
