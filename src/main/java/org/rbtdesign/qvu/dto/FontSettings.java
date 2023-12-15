package org.rbtdesign.qvu.dto;

import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class FontSettings {
    private String font = Constants.DEFAULT_REPORT_FONT;
    private int size = Constants.DEFAULT_REPORT_FONT_SIZE;
    private String color;
    private String backgroundColor;
    private boolean bold = false;
    private boolean italic = false;
    private boolean underline = false;

    public String getFont() {
        return font;
    }

    public void setFont(String font) {
        this.font = font;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public String getFontCss() {
        StringBuilder retval = new StringBuilder("");

        if (StringUtils.isNotEmpty(font)) {
            retval.append("\t\tfont-family: ");
            
            String f = Constants.PDF_FONT_MAP.getOrDefault(font, font);
            
            retval.append(f);
            retval.append(";\n");
            retval.append("\t\tfont-size: ");
            retval.append(size);
            retval.append("pt;\n");

            retval.append("\t\tfont-weight: ");
            if (isBold()) {
                retval.append(Constants.FONT_WEIGHT_BOLD);
            } else {
                retval.append(Constants.FONT_WEIGHT_NORMAL);
            }

            retval.append(";\n");

            if (isItalic()) {
                retval.append("\t\tfont-style: italic;\n");
            }

            if (isUnderline()) {
                retval.append("\t\ttext-decoration: underline;\n");
            }

            retval.append("\t\tcolor: ");
            retval.append(color);
            retval.append(";\n");

            retval.append("\t\tbackground-color: ");
            retval.append(backgroundColor);
            retval.append(";\n");
        }

        return retval.toString();
    }
}
