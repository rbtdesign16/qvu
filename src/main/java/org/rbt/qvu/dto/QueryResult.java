/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryResult {
    private List<String> header = new ArrayList<>();
    private List<Integer> columnTypes = new ArrayList<>();
    private List<Integer> initialColumnWidth = new ArrayList<>();
    private List<List<Object>> data = new ArrayList<>();

    public List<String> getHeader() {
        return header;
    }

    public void setHeader(List<String> header) {
        this.header = header;
    }

    public List<Integer> getColumnTypes() {
        return columnTypes;
    }

    public void setColumnTypes(List<Integer> columnTypes) {
        this.columnTypes = columnTypes;
    }

    public List<List<Object>> getData() {
        return data;
    }

    public void setData(List<List<Object>> data) {
        this.data = data;
    }

    public List<Integer> getInitialColumnWidth() {
        return initialColumnWidth;
    }

    public void setInitialColumnWidth(List<Integer> initialColumnWidth) {
        this.initialColumnWidth = initialColumnWidth;
    }


}
