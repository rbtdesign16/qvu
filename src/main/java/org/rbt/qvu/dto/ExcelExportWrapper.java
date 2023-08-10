/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

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
    private String detailBackgroundColor;
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

    public String getDetailBackgroundColor() {
        return detailBackgroundColor;
    }

    public void setDetailBackgroundColor(String detailBackgroundColor) {
        this.detailBackgroundColor = detailBackgroundColor;
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
    
    
}
