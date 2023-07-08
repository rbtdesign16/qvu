/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.client.utils.SecurityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class SecurityConfiguration {
    private static Logger LOG = LoggerFactory.getLogger(SecurityConfiguration.class);
    private String authenticatorServiceClassName;
    private String securityType;
    private String roleAttributeName = Constants.DEFAULT_ROLE_ATTRIBUTE_NAME;
    private boolean allowServiceSave = false;
    private SamlConfiguration samlConfiguration;
    private OidcConfiguration oidcConfiguration;
    private BasicConfiguration basicConfiguration;
    private Map<String, String> roleAliases = new HashMap<>();
    
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
    
    public SecurityService getAuthenticatorService() throws Exception {
        SecurityService retval = null;
        if (StringUtils.isNotEmpty(authenticatorServiceClassName)) {
            Class c = Class.forName(authenticatorServiceClassName);
            if (SecurityService.class.isAssignableFrom(c)) {
                retval = (SecurityService)c.getDeclaredConstructor().newInstance();
            }
        }
        return retval;
    }
    
    public boolean canAddUsersAndRoles() {
        return (isBasic() || isAllowServiceSave());
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

    public boolean isAllowServiceSave() {
        return StringUtils.isNotEmpty(this.authenticatorServiceClassName) && allowServiceSave;
    }

    public void setAllowServiceSave(boolean allowServiceSave) {
        this.allowServiceSave = allowServiceSave;
    }

    public void postConstruct() {
        LOG.debug("in SecurityConfiguration.postConstruct()");
        if (basicConfiguration != null) {
            basicConfiguration.postConstruct();
        }
    }
   
    public boolean isFileBasedSecurity() {
        boolean retval = false;
        if (basicConfiguration != null) {
            retval = basicConfiguration.isFileBasedSecurity();
        }
        
        return retval;
    }
    
    public String getRoleAlias(String role) {
        return roleAliases.get(role);
    }
}
