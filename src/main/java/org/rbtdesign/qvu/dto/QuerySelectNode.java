package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author rbtuc
 */
public class QuerySelectNode {
    public static final String NODE_TYPE_ROOT = "r";
    public static final String NODE_TYPE_TABLE = "t";
    public static final String NODE_TYPE_COLUMN = "c";
    public static final String NODE_TYPE_IMPORTED_FOREIGNKEY= "ifk";
    public static final String NODE_TYPE_EXPORTED_FOREIGNKEY= "efk";
    
    private String name = "";
    private int id;
    private Map<String, Object> metadata;
    private List<QuerySelectNode> children;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getMetadata() {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
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

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
