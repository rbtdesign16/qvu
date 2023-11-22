package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportDesignSettings {
    private String defaultPageUnits = Constants.DEFAULT_PAGE_UNITS;
    private String defaultPageOrientation = Constants.PAGE_ORIENTATION_PORTRAIT;
    private String defaultPageSize = Constants.PAGE_SIZE_NAMES[0];
    private Double defaultHeaderHeight = Constants.DEFAULT_HEADER_HEIGHT;
    private Double defaultFooterHeight = Constants.DEFAULT_FOOTER_HEIGHT;
    private String defaultFont = Constants.DEFAULT_REPORT_FONT;
    private int defaultFontSize = Constants.DEFAULT_REPORT_FONT_SIZE;
    private String defaultBorderStyle = Constants.DEFAULT_BORDER_STYLE;
    private String defaultForegroundColor = Constants.DEFAULT_REPORT_COMPONENT_FOREGROUND_COLOR;
    private String defaultBackgroundColor = Constants.DEFAULT_REPORT_COMPONENT_BACKGROUND_COLOR;
    private List<Double> defaultPageBorder = new ArrayList<>();
    private List<String> pageSizes = new ArrayList<>();
    private List<String> pageOrientations = new ArrayList<>();
    private List<String> pageUnits = new ArrayList<>();
    private List<String> reportObjectTypes = new ArrayList<>();
    private List<String> defaultFonts = new ArrayList<>();
    private List<String> borderStyles = new ArrayList<>(Arrays.asList(Constants.BORDER_STYLES));
    private List<Integer> defaultFontSizes = new ArrayList<>();
    private List<String> reportShapes = new ArrayList<>(Arrays.asList(Constants.REPORT_SHAPES));
    private Integer defaultBorderWidth = Constants.DEFAULT_BORDER_WIDTH;
    private String defaultBorderColor = Constants.DEFAULT_BORDER_COLOR;
    private List<Integer> borderWidths = new ArrayList<>(Arrays.asList(Constants.BORDER_WIDTHS));
    private Map<String, double[]> pageSizeSettings;
    private String defaultBorderRadius = "10px";
    
    public String getDefaultPageUnits() {
        return defaultPageUnits;
    }

    public void setDefaultPageUnits(String defaultPageUnits) {
        this.defaultPageUnits = defaultPageUnits;
    }

    public String getDefaultPageOrientation() {
        return defaultPageOrientation;
    }

    public void setDefaultPageOrientation(String defaultPageOrientation) {
        this.defaultPageOrientation = defaultPageOrientation;
    }

    public String getDefaultPageSize() {
        return defaultPageSize;
    }

    public void setDefaultPageSize(String defaultPageSize) {
        this.defaultPageSize = defaultPageSize;
    }

    public List<String> getPageSizes() {
        return pageSizes;
    }

    public void setPageSizes(List<String> pageSizes) {
        this.pageSizes = pageSizes;
    }

    public List<String> getPageOrientations() {
        return pageOrientations;
    }

    public void setPageOrientations(List<String> pageOrientations) {
        this.pageOrientations = pageOrientations;
    }

    public List<String> getPageUnits() {
        return pageUnits;
    }

    public void setPageUnits(List<String> pageUnits) {
        this.pageUnits = pageUnits;
    }

    public List<String> getReportObjectTypes() {
        return reportObjectTypes;
    }

    public void setReportObjectTypes(List<String> reportObjectTypes) {
        this.reportObjectTypes = reportObjectTypes;
    }

    public Map<String, double[]> getPageSizeSettings() {
        return pageSizeSettings;
    }

    public void setPageSizeSettings(Map<String, double[]> pageSizeSettings) {
        this.pageSizeSettings = pageSizeSettings;
    }

    public List<Double> getDefaultPageBorder() {
        return defaultPageBorder;
    }

    public void setDefaultPageBorder(List<Double> defaultPageBorder) {
        this.defaultPageBorder = defaultPageBorder;
    }

    public Double getDefaultHeaderHeight() {
        return defaultHeaderHeight;
    }

    public void setDefaultHeaderHeight(Double defaultHeaderHeight) {
        this.defaultHeaderHeight = defaultHeaderHeight;
    }

    public Double getDefaultFooterHeight() {
        return defaultFooterHeight;
    }

    public void setDefaultFooterHeight(Double defaultFooterHeight) {
        this.defaultFooterHeight = defaultFooterHeight;
    }

    public List<String> getDefaultFonts() {
        return defaultFonts;
    }

    public void setDefaultFonts(List<String> defaultFonts) {
        this.defaultFonts = defaultFonts;
    }

    public List<Integer> getDefaultFontSizes() {
        return defaultFontSizes;
    }

    public void setDefaultFontSizes(List<Integer> defaultFontSizes) {
        this.defaultFontSizes = defaultFontSizes;
    }

    public String getDefaultForegroundColor() {
        return defaultForegroundColor;
    }

    public void setDefaultForegroundColor(String defaultForegroundColor) {
        this.defaultForegroundColor = defaultForegroundColor;
    }

    public String getDefaultBackgroundColor() {
        return defaultBackgroundColor;
    }

    public void setDefaultBackgroundColor(String defaultBackgroundColor) {
        this.defaultBackgroundColor = defaultBackgroundColor;
    }

    public List<String> getReportShapes() {
        return reportShapes;
    }

    public void setReportShapes(List<String> reportShapes) {
        this.reportShapes = reportShapes;
    }

    public String getDefaultFont() {
        return defaultFont;
    }

    public void setDefaultFont(String defaultFont) {
        this.defaultFont = defaultFont;
    }

    public int getDefaultFontSize() {
        return defaultFontSize;
    }

    public void setDefaultFontSize(int defaultFontSize) {
        this.defaultFontSize = defaultFontSize;
    }

    public String getDefaultBorderStyle() {
        return defaultBorderStyle;
    }

    public void setDefaultBorderStyle(String defaultBorderStyle) {
        this.defaultBorderStyle = defaultBorderStyle;
    }

    public List<String> getBorderStyles() {
        return borderStyles;
    }

    public void setBorderStyles(List<String> borderStyles) {
        this.borderStyles = borderStyles;
    }

    public Integer getDefaultBorderWidth() {
        return defaultBorderWidth;
    }

    public void setDefaultBorderWidth(Integer defaultBorderWidth) {
        this.defaultBorderWidth = defaultBorderWidth;
    }

    public List<Integer> getBorderWidths() {
        return borderWidths;
    }

    public void setBorderWidths(List<Integer> borderWidths) {
        this.borderWidths = borderWidths;
    }

    public String getDefaultBorderColor() {
        return defaultBorderColor;
    }

    public void setDefaultBorderColor(String defaultBorderColor) {
        this.defaultBorderColor = defaultBorderColor;
    }

    public String getDefaultBorderRadius() {
        return defaultBorderRadius;
    }

    public void setDefaultBorderRadius(String defaultBorderRadius) {
        this.defaultBorderRadius = defaultBorderRadius;
    }
    
    
}
