package org.rbtdesign.qvu.dto;

import org.rbtdesign.qvu.configuration.security.BasicConfiguration;
import org.rbtdesign.qvu.configuration.security.OidcConfiguration;

/**
 *
 * @author rbtuc
 */
public class AuthConfig {
    private String securityType;
    private BasicConfiguration basicConfiguration;
    private OidcConfiguration oidcConfiguration;
    private boolean modified;

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
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

    public boolean isModified() {
        return modified;
    }

    public void setModified(boolean modified) {
        this.modified = modified;
    }
}
