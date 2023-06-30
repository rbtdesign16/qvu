/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import org.rbt.qvu.configuration.security.BasicConfiguration;
import org.rbt.qvu.configuration.security.OidcConfiguration;
import org.rbt.qvu.configuration.security.SamlConfiguration;

/**
 *
 * @author rbtuc
 */
public class InitialSetup {
    private String repository;
    private String adminPassword;
    private String securityType;
    private String langKey;
    private String securityServiceClass;
    private boolean fileBasedSecurity;
    private boolean allowServiceSave;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private BasicConfiguration basicConfiguration;

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }

    public String getSecurityServiceClass() {
        return securityServiceClass;
    }

    public void setSecurityServiceClass(String securityServiceClass) {
        this.securityServiceClass = securityServiceClass;
    }

    public boolean isFileBasedSecurity() {
        return fileBasedSecurity;
    }

    public void setFileBasedSecurity(boolean fileBasedSecurity) {
        this.fileBasedSecurity = fileBasedSecurity;
    }

    public boolean isAllowServiceSave() {
        return allowServiceSave;
    }

    public void setAllowServiceSave(boolean allowServiceSave) {
        this.allowServiceSave = allowServiceSave;
    }

    public SamlConfiguration getSamlConfiguration() {
        return samlConfiguration;
    }

    public void setSamlConfiguration(SamlConfiguration samlConfiguration) {
        this.samlConfiguration = samlConfiguration;
    }

    public OidcConfiguration getOidcConfiguration() {
        return oidcConfiguration;
    }

    public void setOidcConfiguration(OidcConfiguration oidcConfiguration) {
        this.oidcConfiguration = oidcConfiguration;
    }

    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public BasicConfiguration getBasicConfiguration() {
        return basicConfiguration;
    }

    public void setBasicConfiguration(BasicConfiguration basicConfiguration) {
        this.basicConfiguration = basicConfiguration;
    }
    
    
    
    
}
