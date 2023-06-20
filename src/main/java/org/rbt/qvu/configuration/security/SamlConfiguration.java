/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

/**
 *
 * @author rbtuc
 */
public class SamlConfiguration {
    private String idpUrl;
    private boolean signAssertions;
    private String spEntityId;
    private String signingCertFileName;
    private String signingKeyFileName;

    public String getIdpUrl() {
        return idpUrl;
    }

    public void setIdpUrl(String idpUrl) {
        this.idpUrl = idpUrl;
    }

    public boolean isSignAssertions() {
        return signAssertions;
    }

    public void setSignAssertions(boolean signAssertions) {
        this.signAssertions = signAssertions;
    }

    public String getSpEntityId() {
        return spEntityId;
    }

    public void setSpEntityId(String spEntityId) {
        this.spEntityId = spEntityId;
    }

    public String getSigningCertFileName() {
        return signingCertFileName;
    }

    public void setSigningCertFileName(String signingCertFileName) {
        this.signingCertFileName = signingCertFileName;
    }

    public String getSigningKeyFileName() {
        return signingKeyFileName;
    }

    public void setSigningKeyFileName(String signingKeyFileName) {
        this.signingKeyFileName = signingKeyFileName;
    }
    
    
}
