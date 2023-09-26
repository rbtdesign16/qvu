package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rbtuc
 */
public class DocumentSchedule {
    private List<Integer> months = new ArrayList<>();;
    private List <Integer> daysOfWeek = new ArrayList<>();
    private List<Integer> daysOfMonth = new ArrayList<>();
    private List<Integer> hoursOfDay = new ArrayList<>();
    private String documentType;
    private String documentName;
    private String documentGroup;
    private List<String> emailAddresses = new ArrayList<>();

    public List<Integer> getMonths() {
        return months;
    }

    public void setMonths(List<Integer> months) {
        this.months = months;
    }

    public List<Integer> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(List<Integer> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public List<Integer> getDaysOfMonth() {
        return daysOfMonth;
    }

    public void setDaysOfMonth(List<Integer> daysOfMonth) {
        this.daysOfMonth = daysOfMonth;
    }

    public List<Integer> getHoursOfDay() {
        return hoursOfDay;
    }

    public void setHoursOfDay(List<Integer> hoursOfDay) {
        this.hoursOfDay = hoursOfDay;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentGroup() {
        return documentGroup;
    }

    public void setDocumentGroup(String documentGroup) {
        this.documentGroup = documentGroup;
    }

    public List<String> getEmailAddresses() {
        return emailAddresses;
    }

    public void setEmailAddresses(List<String> emailAddresses) {
        this.emailAddresses = emailAddresses;
    }


}
