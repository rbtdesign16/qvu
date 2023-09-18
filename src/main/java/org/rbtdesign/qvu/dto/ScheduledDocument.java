package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ScheduledDocument {
    private String group;
    private String document;
    private String resultType = Constants.RESULT_TYPE_CSV;
    private List<QueryParameter> parameters  = new ArrayList<>();
    private String emails;

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public List<QueryParameter> getParameters() {
        return parameters;
    }

    public void setParameters(List<QueryParameter> parameters) {
        this.parameters = parameters;
    }

    public String getEmails() {
        return emails;
    }

    public void setEmails(String emails) {
        this.emails = emails;
    }


    public String getResultType() {
        return resultType;
    }

    public void setResultType(String resultType) {
        this.resultType = resultType;
    }
  
    
}
