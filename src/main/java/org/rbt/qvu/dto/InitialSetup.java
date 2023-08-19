/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import org.rbt.qvu.configuration.security.OidcConfiguration;
import org.rbt.qvu.configuration.security.SamlConfiguration;

/**
 *
 * @author rbtuc
 */
public class InitialSetup {
    private String repository;
    private String securityType;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;

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
}
