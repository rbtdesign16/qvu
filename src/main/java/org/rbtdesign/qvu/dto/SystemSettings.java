package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class SystemSettings {
    private AuthConfig authConfig;
    private EmailConfig emailConfig;

    public AuthConfig getAuthConfig() {
        return authConfig;
    }

    public void setAuthConfig(AuthConfig authConfig) {
        this.authConfig = authConfig;
    }

    public EmailConfig getEmailConfig() {
        return emailConfig;
    }

    public void setEmailConfig(EmailConfig emailConfig) {
        this.emailConfig = emailConfig;
    }
    
    
}
