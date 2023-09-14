package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.configuration.security.OidcConfiguration;

/**
 *
 * @author rbtuc
 */
public class InitialSetup {
    private String repository;
    private String securityType;
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


    public OidcConfiguration getOidcConfiguration() {
        return oidcConfiguration;
    }

    public void setOidcConfiguration(OidcConfiguration oidcConfiguration) {
        this.oidcConfiguration = oidcConfiguration;
    }
}
