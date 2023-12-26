package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class BorderSettings {
    private String border = Constants.DEFAULT_BORDER_STYLE;
    private int width = Constants.DEFAULT_BORDER_WIDTH;
    private boolean left = false;
    private boolean top = false;
    private boolean right = false;
    private boolean bottom = false;
    private boolean rounded = false;
    private String color = Constants.DEFAULT_BORDER_COLOR;

    public String getBorder() {
        return border;
    }

    public void setBorder(String border) {
        this.border = border;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public boolean isLeft() {
        return left;
    }

    public void setLeft(boolean left) {
        this.left = left;
    }

    public boolean isTop() {
        return top;
    }

    public void setTop(boolean top) {
        this.top = top;
    }

    public boolean isRight() {
        return right;
    }

    public void setRight(boolean right) {
        this.right = right;
    }

    public boolean isBottom() {
        return bottom;
    }

    public void setBottom(boolean bottom) {
        this.bottom = bottom;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public boolean isRounded() {
        return rounded;
    }

    public void setRounded(boolean rounded) {
        this.rounded = rounded;
    }
    
    public String getBorderCss() {
        StringBuilder retval = new StringBuilder("");
        if (!Constants.NONE.equals(border)) {
            if (isTop() && isRight() && isBottom() && isLeft()) {
                retval.append("\t\tborder: ");
                retval.append(border);
                retval.append(" ");
                retval.append(width);
                retval.append("px ");
                retval.append(color);
                retval.append(";\n");
            } else {
                if (isTop()) {
                    retval.append("\t\tborder-top: ");
                    retval.append(border);
                    retval.append(" ");
                    retval.append(width);
                    retval.append("px ");
                    retval.append(color);
                    retval.append(";\n");
                }  

                 if (isRight()) {
                    retval.append("\t\tborder-right: ");
                    retval.append(border);
                    retval.append(" ");
                    retval.append(width);
                    retval.append("px ");
                    retval.append(color);
                    retval.append(";\n");
                }  

                if (isBottom()) {
                    retval.append("\t\tborder-bottom: ");
                    retval.append(border);
                    retval.append(" ");
                    retval.append(width);
                    retval.append("px ");
                    retval.append(color);
                    retval.append(";\n");
                }  

                if (isLeft()) {
                    retval.append("\t\tborder-left: ");
                    retval.append(border);
                    retval.append(" ");
                    retval.append(width);
                    retval.append("px ");
                    retval.append(color);
                    retval.append(";\n");
                }  
            }

            if (isRounded()) {
                retval.append("\t\tborder-radius: ");
                retval.append(Constants.DEFAULT_BORDER_RADIUS);
                retval.append(";\n");
            }
        }
        
        return retval.toString();
    }
}
