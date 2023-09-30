package org.rbtdesign.qvu.dto;

/**
 *
 * @author rbtuc
 */
public class SchedulerConfig {
    private boolean smtpAuth = false;
    private boolean smtpStartTtlsEnable = false;
    private String smtpHost;
    private String smtpPort;
    private String smtpSslTrust;
    private String mailUser;
    private String mailPassword;
    private String mailFrom;
    private String mailSubject;
    private int maxSchedulerPoolSize;
    private int schedulerExecuteTimeoutSeconds;
    private boolean enabled = false;
    private boolean modified = false;
    

    public boolean isSmtpAuth() {
        return smtpAuth;
    }

    public void setSmtpAuth(boolean smtpAuth) {
        this.smtpAuth = smtpAuth;
    }

    public boolean isSmtpStartTtlsEnable() {
        return smtpStartTtlsEnable;
    }

    public void setSmtpStartTtlsEnable(boolean smtpStartTtlsEnable) {
        this.smtpStartTtlsEnable = smtpStartTtlsEnable;
    }

    public String getSmtpHost() {
        return smtpHost;
    }

    public void setSmtpHost(String smtpHost) {
        this.smtpHost = smtpHost;
    }

    public String getSmtpPort() {
        return smtpPort;
    }

    public void setSmtpPort(String smtpPort) {
        this.smtpPort = smtpPort;
    }

    public String getSmtpSslTrust() {
        return smtpSslTrust;
    }

    public void setSmtpSslTrust(String smtpSslTrust) {
        this.smtpSslTrust = smtpSslTrust;
    }

    public String getMailUser() {
        return mailUser;
    }

    public void setMailUser(String mailUser) {
        this.mailUser = mailUser;
    }

    public String getMailPassword() {
        return mailPassword;
    }

    public void setMailPassword(String mailPassword) {
        this.mailPassword = mailPassword;
    }

    public String getMailFrom() {
        return mailFrom;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }

    public String getMailSubject() {
        return mailSubject;
    }

    public void setMailSubject(String mailSubject) {
        this.mailSubject = mailSubject;
    }

    public int getMaxSchedulerPoolSize() {
        return maxSchedulerPoolSize;
    }

    public void setMaxSchedulerPoolSize(int maxSchedulerPoolSize) {
        this.maxSchedulerPoolSize = maxSchedulerPoolSize;
    }

    public int getSchedulerExecuteTimeoutSeconds() {
        return schedulerExecuteTimeoutSeconds;
    }

    public void setSchedulerExecuteTimeoutSeconds(int schedulerExecuteTimeoutSeconds) {
        this.schedulerExecuteTimeoutSeconds = schedulerExecuteTimeoutSeconds;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isModified() {
        return modified;
    }

    public void setModified(boolean modified) {
        this.modified = modified;
    }
    
    
}