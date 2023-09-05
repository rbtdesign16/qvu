/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.configuration.security;

/**
 *
 * @author rbtuc
 */
public class OidcConfiguration {
    private String issuerLocationUrl;
    private String clientId;
    private String clientSecret;
    private String incomingAdminRoles;
    private String roleClaimPropertyName;
    private boolean useEmailForUserId;

    public String getIssuerLocationUrl() {
        return issuerLocationUrl;
    }

    public void setIssuerLocationUrl(String issuerLocationUrl) {
        this.issuerLocationUrl = issuerLocationUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getIncomingAdminRoles() {
        return incomingAdminRoles;
    }

    public void setIncomingAdminRoles(String incomingAdminRoles) {
        this.incomingAdminRoles = incomingAdminRoles;
    }

    public String getRoleClaimPropertyName() {
        return roleClaimPropertyName;
    }

    public void setRoleClaimPropertyName(String roleClaimPropertyName) {
        this.roleClaimPropertyName = roleClaimPropertyName;
    }

    public boolean isUseEmailForUserId() {
        return useEmailForUserId;
    }

    public void setUseEmailForUserId(boolean useEmailForUserId) {
        this.useEmailForUserId = useEmailForUserId;
    }
    
    
 }
