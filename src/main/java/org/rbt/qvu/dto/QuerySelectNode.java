/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author rbtuc
 */
public class QuerySelectNode {
    public static final String NODE_TYPE_ROOT = "t";
    public static final String NODE_TYPE_TABLE = "t";
    public static final String NODE_TYPE_COLUMN = "c";
    public static final String NODE_TYPE_IMPORTED_FOREIGNKEY= "ifk";
    public static final String NODE_TYPE_EXPORTED_FOREIGNKEY= "efk";
    
    private String name = "";
    private String dbName;
    private String type = QuerySelectNode.NODE_TYPE_ROOT;
    private boolean selected;
   // private Integer id;
  //  private Integer parent;
    private Map<String, Object> additionalInfo;
    private List<QuerySelectNode> children;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isSelected() {
        return selected;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }


    public List<QuerySelectNode> getChildren() {
        if (children == null) {
            children = new ArrayList<>();
        }
        return children;
    }

    public void setChildren(List<QuerySelectNode> children) {
        this.children = children;
    }

    public Map<String, Object> getAdditionalInfo() {
        if (additionalInfo == null) {
            additionalInfo = new HashMap<>();
        }
        return additionalInfo;
    }

    public void setAdditionalInfo(Map<String, Object> additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    /*
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getParent() {
        return parent;
    }

    public void setParent(Integer parent) {
        this.parent = parent;
    }
*/
   
}
