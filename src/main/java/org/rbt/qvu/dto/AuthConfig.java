/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import org.rbt.qvu.configuration.security.BasicConfiguration;
import org.rbt.qvu.configuration.security.OidcConfiguration;

/**
 *
 * @author rbtuc
 */
public class AuthConfig {
    private String defaultSecurityType;
    private BasicConfiguration basicConfiguration;
    private OidcConfiguration oidcConfiguration;

    public String getDefaultSecurityType() {
        return defaultSecurityType;
    }

    public void setDefaultSecurityType(String defaultSecurityType) {
        this.defaultSecurityType = defaultSecurityType;
    }

    public BasicConfiguration getBasicConfiguration() {
        return basicConfiguration;
    }

    public void setBasicConfiguration(BasicConfiguration basicConfiguration) {
        this.basicConfiguration = basicConfiguration;
    }

    public OidcConfiguration getOidcConfiguration() {
        return oidcConfiguration;
    }

    public void setOidcConfiguration(OidcConfiguration oidcConfiguration) {
        this.oidcConfiguration = oidcConfiguration;
    }
}
