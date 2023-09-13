package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class QueryParameter {
    public static final String STRING_TYPE = "string";
    public static final String FLOAT_TYPE = "float";
    public static final String INTEGER_TYPE = "integer";
    public static final String DATE_TYPE = "date";
    public static final String TIMESTAMP_TYPE = "timestamp";
    public static final String TIME_TYPE = "time";
    public static final String BOOLEAN_TYPE = "boolean";
    
    private String value;
    private String dataTypeName;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDataTypeName() {
        return dataTypeName;
    }

    public void setDataTypeName(String dataTypeName) {
        this.dataTypeName = dataTypeName;
    }
    
    
}
