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
}
