/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class ExcelExportWrapper {
    private QueryResult queryResults;
    private String headerFontColor;
    private String headerBackgroundColor;
    private int headerFontSize;
    private String detailFontColor;
    private String detailBackgroundColor1;
    private String detailBackgroundColor2;
    private int detailFontSize;
    private String name;

    public QueryResult getQueryResults() {
        return queryResults;
    }

    public void setQueryResults(QueryResult queryResults) {
        this.queryResults = queryResults;
    }

    public String getHeaderFontColor() {
        return headerFontColor;
    }

    public void setHeaderFontColor(String headerFontColor) {
        this.headerFontColor = headerFontColor;
    }

    public String getHeaderBackgroundColor() {
        return headerBackgroundColor;
    }

    public void setHeaderBackgroundColor(String headerBackgroundColor) {
        this.headerBackgroundColor = headerBackgroundColor;
    }

    public int getHeaderFontSize() {
        return headerFontSize;
    }

    public void setHeaderFontSize(int headerFontSize) {
        this.headerFontSize = headerFontSize;
    }

    public String getDetailFontColor() {
        return detailFontColor;
    }

    public void setDetailFontColor(String detailFontColor) {
        this.detailFontColor = detailFontColor;
    }

    public int getDetailFontSize() {
        return detailFontSize;
    }

    public void setDetailFontSize(int detailFontSize) {
        this.detailFontSize = detailFontSize;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDetailBackgroundColor1() {
        return detailBackgroundColor1;
    }

    public void setDetailBackgroundColor1(String detailBackgroundColor1) {
        this.detailBackgroundColor1 = detailBackgroundColor1;
    }

    public String getDetailBackgroundColor2() {
        return detailBackgroundColor2;
    }

    public void setDetailBackgroundColor2(String detailBackgroundColor2) {
        this.detailBackgroundColor2 = detailBackgroundColor2;
    }
    
    
}
