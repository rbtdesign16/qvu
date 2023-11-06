package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class Rect {
    private double left;
    private double top;
    private double width;
    private double height;

    public Rect() {
    }

    public Rect(double left, double top, double width, double height) {
        this.left = left;
        this.height = height;
        this.top = top;
        this.width = width;
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
}
