package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class SystemSettings {
    private AuthConfig authConfig;
    private SchedulerConfig schedulerConfig;
    private SSLConfig sslConfig;
    private MiscConfig miscConfig;
    
    public AuthConfig getAuthConfig() {
        return authConfig;
    }

    public void setAuthConfig(AuthConfig authConfig) {
        this.authConfig = authConfig;
    }

    public SchedulerConfig getSchedulerConfig() {
        return schedulerConfig;
    }

    public void setSchedulerConfig(SchedulerConfig schedulerConfig) {
        this.schedulerConfig = schedulerConfig;
    }

    public SSLConfig getSslConfig() {
        return sslConfig;
    }

    public void setSslConfig(SSLConfig sslConfig) {
        this.sslConfig = sslConfig;
    }

    public MiscConfig getMiscConfig() {
        return miscConfig;
    }

    public void setMiscConfig(MiscConfig miscConfig) {
        this.miscConfig = miscConfig;
    }
    
    
}
