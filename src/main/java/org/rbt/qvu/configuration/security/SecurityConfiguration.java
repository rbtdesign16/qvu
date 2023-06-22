/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.QvuAuthenticationService;

/**
 *
 * @author rbtuc
 */
public class SecurityConfiguration {
    public  static final String TYPE_SAML = "saml";
    public  static final String TYPE_OIDC = "oidc";
    public  static final String TYPE_BASIC = "basic";
    
    private String authenticatorServiceClassName;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private BasicConfiguration basicConfiguration;

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

    public BasicConfiguration getBasicConfiguration() {
        return basicConfiguration;
    }

    public void setBasicConfiguration(BasicConfiguration basicConfiguration) {
        this.basicConfiguration = basicConfiguration;
    }

    public String getAuthenticatorServiceClassName() {
        return authenticatorServiceClassName;
    }

    public void setAuthenticatorServiceClassName(String authenticatorServiceClassName) {
        this.authenticatorServiceClassName = authenticatorServiceClassName;
    }
    
    public QvuAuthenticationService getAuthenticatorService() throws Exception {
        QvuAuthenticationService retval = null;
        if (StringUtils.isNotEmpty(authenticatorServiceClassName)) {
            Class c = Class.forName(authenticatorServiceClassName);
            if (QvuAuthenticationService.class.isAssignableFrom(c)) {
                retval = (QvuAuthenticationService)c.getDeclaredConstructor().newInstance();
            }
        }
        return retval;
    }
}
