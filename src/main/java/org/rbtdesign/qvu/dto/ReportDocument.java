package org.rbtdesign.qvu.dto;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ReportDocument {
    private String runUser;
    private String name;
    private String path;
    private String createdBy;
    private String updatedBy;
    private Timestamp createDate;
    private Timestamp lastUpdated;
    private String savedDocumentGroupName;
    private String documentGroupName;
    private boolean newRecord;
    private String pageOrientation = Constants.PAGE_ORIENTATION_LANDSCAPE;
    private String pageSize = Constants.DEFAULT_PAGE_SIZE;
    private String pageUnits = Constants.DEFAULT_PAGE_UNITS;
    private String queryDocumentGroup;
    private String queryDocumentName;
    private Double headerHeight = Constants.DEFAULT_HEADER_HEIGHT;
    private Double footerHeight = Constants.DEFAULT_FOOTER_HEIGHT;
    private List<Double> pageBorder = Arrays.asList(Constants.DEFAULT_PAGE_BORDER );
    private List<ReportComponent> reportComponents = new ArrayList<>();
    private List<String> queryParameters = new ArrayList<>();
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getSavedDocumentGroupName() {
        return savedDocumentGroupName;
    }

    public void setSavedDocumentGroupName(String savedDocumentGroupName) {
        this.savedDocumentGroupName = savedDocumentGroupName;
    }

    public String getDocumentGroupName() {
        return documentGroupName;
    }

    public void setDocumentGroupName(String documentGroupName) {
        this.documentGroupName = documentGroupName;
    }

    public boolean isNewRecord() {
        return newRecord;
    }

    public void setNewRecord(boolean newRecord) {
        this.newRecord = newRecord;
    }

    public String getPageOrientation() {
        return pageOrientation;
    }

    public void setPageOrientation(String pageOrientation) {
        this.pageOrientation = pageOrientation;
    }

    public String getPageSize() {
        return pageSize;
    }

    public void setPageSize(String pageSize) {
        this.pageSize = pageSize;
    }

    public String getPageUnits() {
        return pageUnits;
    }

    public void setPageUnits(String pageUnits) {
        this.pageUnits = pageUnits;
    }

    public String getQueryDocumentGroup() {
        return queryDocumentGroup;
    }

    public void setQueryDocumentGroup(String queryDocumentGroup) {
        this.queryDocumentGroup = queryDocumentGroup;
    }

    public String getQueryDocumentName() {
        return queryDocumentName;
    }

    public void setQueryDocumentName(String queryDocumentName) {
        this.queryDocumentName = queryDocumentName;
    }

    public Double getHeaderHeight() {
        return headerHeight;
    }

    public void setHeaderHeight(Double headerHeight) {
        this.headerHeight = headerHeight;
    }

    public Double getFooterHeight() {
        return footerHeight;
    }

    public void setFooterHeight(Double footerHeight) {
        this.footerHeight = footerHeight;
    }

    public List<Double> getPageBorder() {
        return pageBorder;
    }

    public void setPageBorder(List<Double> pageBorder) {
        this.pageBorder = pageBorder;
    }

    public List<ReportComponent> getReportComponents() {
        return reportComponents;
    }

    public void setReportComponents(List<ReportComponent> reportComponents) {
        this.reportComponents = reportComponents;
    }

    public String getRunUser() {
        return runUser;
    }

    public void setRunUser(String runUser) {
        this.runUser = runUser;
    }

    public List<String> getQueryParameters() {
        return queryParameters;
    }

    public void setQueryParameters(List<String> queryParameters) {
        this.queryParameters = queryParameters;
    }
    
    
}
