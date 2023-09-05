/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class QueryDocumentRunWrapper {
    private List<QueryParameter> parameters = new ArrayList<>();
    private QueryDocument document;

    public List<QueryParameter> getParameters() {
        return parameters;
    }

    public void setParameters(List<QueryParameter> parameters) {
        this.parameters = parameters;
    }


    public QueryDocument getDocument() {
        return document;
    }

    public void setDocument(QueryDocument document) {
        this.document = document;
    }
    
    
    
}
