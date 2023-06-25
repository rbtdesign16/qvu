/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.QvuAuthenticationService;
import org.rbt.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class SecurityConfiguration {
    
    private String authenticatorServiceClassName = "org.rbt.qvu.configuration.security.DefaultBasicAuthenticator";
    private String securityType;
    private String roleAttributeName = Constants.DEFAULT_ROLE_ATTRIBUTE_NAME;
    private boolean fileBasedSecurity = false;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private BasicConfiguration basicConfiguration;
    private String administratorRole = Constants.DEFAULT_ADMINISTRATOR_ROLE;
    private String queryDesignerRole = Constants.DEFAULT_QUERY_DESIGNER_ROLE;
    private String reportDesignerRole = Constants.DEFAULT_REPORT_DESIGNER_ROLE;
    private String userRole = Constants.DEFAULT_USER_ROLE;
    
    
    
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
    
    public boolean canAddUsersAndRoles() {
        return (isBasic() && StringUtils.isEmpty(this.authenticatorServiceClassName));
    }

    public String getSecurityType() {
        return securityType;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }
    
    public boolean isBasic() {
        return Constants.BASIC_SECURITY_TYPE.equals(this.securityType);
    }

    public String getRoleAttributeName() {
        return roleAttributeName;
    }

    public void setRoleAttributeName(String roleAttributeName) {
        this.roleAttributeName = roleAttributeName;
    }

    public boolean isFileBasedSecurity() {
        return fileBasedSecurity;
    }

    public void setFileBasedSecurity(boolean fileBasedSecurity) {
        this.fileBasedSecurity = fileBasedSecurity;
    }

    public String getAdministratorRole() {
        return administratorRole;
    }

    public void setAdministratorRole(String administratorRole) {
        this.administratorRole = administratorRole;
    }

    public String getQueryDesignerRole() {
        return queryDesignerRole;
    }

    public void setQueryDesignerRole(String queryDesignerRole) {
        this.queryDesignerRole = queryDesignerRole;
    }

    public String getReportDesignerRole() {
        return reportDesignerRole;
    }

    public void setReportDesignerRole(String reportDesignerRole) {
        this.reportDesignerRole = reportDesignerRole;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
    
    
}
