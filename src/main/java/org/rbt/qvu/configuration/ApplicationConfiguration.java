/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import java.io.File;
import org.rbt.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class ApplicationConfiguration {
    private String securityType;
    private String repositoryFolder;

    public String getRepositoryFolder() {
        return repositoryFolder;
    }

    public void setRepositoryFolder(String repositoryFolder) {
        this.repositoryFolder = repositoryFolder;
    }

    
    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }

    public String getQueryDocumentsFolder() {
        return repositoryFolder + File.separator + "query-documents";
    }

    public String getReportDocumentsFolder() {
        return repositoryFolder + File.separator + "report-documents";
    }

    public String getSecurityConfigurationFile() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.SECURITY_CONFIG_FILE_NAME;
    }

    public String getDatasourceConfigurationFile() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.DATASOURCES_CONFIG_FILE_NAME;
    }

    public String getLanguageFile() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.LANGUAGE_FILE_NAME;
    }
}
