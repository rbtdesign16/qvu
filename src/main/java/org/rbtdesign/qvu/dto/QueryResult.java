package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryResult {
    private Integer rowCount;
    private Integer currentRow = 0;
    private double elapsedTimeSeconds = 0;
    private List<String> header = new ArrayList<>();
    private List<Integer> columnTypes = new ArrayList<>();
    private List<Integer> initialColumnWidths = new ArrayList<>();
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

    public List<Integer> getInitialColumnWidths() {
        return initialColumnWidths;
    }

    public void setInitialColumnWidths(List<Integer> initialColumnWidths) {
        this.initialColumnWidths = initialColumnWidths;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public void setRowCount(Integer rowCount) {
        this.rowCount = rowCount;
    }

    public double getElapsedTimeSeconds() {
        return elapsedTimeSeconds;
    }

    public void setElapsedTimeSeconds(double elapsedTimeSeconds) {
        this.elapsedTimeSeconds = elapsedTimeSeconds;
    }

    public Integer getCurrentRow() {
        return currentRow;
    }

    public void setCurrentRow(Integer currentRow) {
        this.currentRow = currentRow;
    }

   
}
