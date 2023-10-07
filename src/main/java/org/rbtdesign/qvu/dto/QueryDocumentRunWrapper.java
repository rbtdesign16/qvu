package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryDocumentRunWrapper {
    private List<String> parameters = new ArrayList<>();
    private QueryDocument document;
 
    public QueryDocumentRunWrapper() {};
    public QueryDocumentRunWrapper(QueryDocument document) {
        this.document = document;
    }
    
    public QueryDocumentRunWrapper(QueryDocument document, List<String> parameters) {
        this.document = document;
        this.parameters = parameters;
    }

    
    public QueryDocument getDocument() {
        return document;
    }

    public void setDocument(QueryDocument document) {
        this.document = document;
    }

    public List<String> getParameters() {
        return parameters;
    }

    public void setParameters(List<String> parameters) {
        this.parameters = parameters;
    }
}
