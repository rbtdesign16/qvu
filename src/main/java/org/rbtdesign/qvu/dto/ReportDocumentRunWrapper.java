package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class ReportDocumentRunWrapper {
    private List<String> parameters = new ArrayList<>();
    private ReportDocument document;
 
    public ReportDocumentRunWrapper() {};
    public ReportDocumentRunWrapper(ReportDocument document) {
        this.document = document;
    }
    
    public ReportDocumentRunWrapper(ReportDocument document, List<String> parameters) {
        this.document = document;
        this.parameters = parameters;
    }

    
    public ReportDocument getDocument() {
        return document;
    }

    public void setDocument(ReportDocument document) {
        this.document = document;
    }

    public List<String> getParameters() {
        return parameters;
    }

    public void setParameters(List<String> parameters) {
        this.parameters = parameters;
    }
}
