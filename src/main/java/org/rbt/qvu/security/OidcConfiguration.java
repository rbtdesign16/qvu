/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.security;

/**
 *
 * @author rbtuc
 */
public class OidcConfiguration {
    private String issuerLocationUrl;
    private String clientId;
    private String clientSecret;

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


}
