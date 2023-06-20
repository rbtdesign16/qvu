/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

/**
 *
 * @author rbtuc
 */
public class ApplicationConfiguration {
    private String securityType;
    private String queryDocumentsFolder;
    private String reportDocumentsFolder;
    private String securityConfigurationFile;
    private String databaseConfigurationFile;

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }

    public String getQueryDocumentsFolder() {
        return queryDocumentsFolder;
    }

    public void setQueryDocumentsFolder(String queryDocumentsFolder) {
        this.queryDocumentsFolder = queryDocumentsFolder;
    }

    public String getReportDocumentsFolder() {
        return reportDocumentsFolder;
    }

    public void setReportDocumentsFolder(String reportDocumentsFolder) {
        this.reportDocumentsFolder = reportDocumentsFolder;
    }

    public String getSecurityConfigurationFile() {
        return securityConfigurationFile;
    }

    public void setSecurityConfigurationFile(String securityConfigurationFile) {
        this.securityConfigurationFile = securityConfigurationFile;
    }

    public String getDatabaseConfigurationFile() {
        return databaseConfigurationFile;
    }

    public void setDatabaseConfigurationFile(String databaseConfigurationFile) {
        this.databaseConfigurationFile = databaseConfigurationFile;
    }
    
    
}
