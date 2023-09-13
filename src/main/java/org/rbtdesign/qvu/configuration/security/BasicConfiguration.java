package org.rbtdesign.qvu.configuration.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.SecurityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class BasicConfiguration {
    private static final Logger LOG = LoggerFactory.getLogger(BasicConfiguration.class);
    private String securityServiceClass;
    
    @JsonIgnore
    private SecurityService securityService;

    public String getSecurityServiceClass() {
        return securityServiceClass;
    }

    public void setSecurityServiceClass(String securityServiceClass) {
        this.securityServiceClass = securityServiceClass;
    }
    
   
    public SecurityService getSecurityService() {
        SecurityService retval = securityService;
        
        if ((retval == null) && StringUtils.isNotEmpty(securityServiceClass)) {
            try {
                securityService =  (SecurityService) Class.forName(securityServiceClass).newInstance();
                return securityService;
            } catch (Exception ex) {
                LOG.error(ex.toString(), ex);
            }
        }
        
        return retval;
    }
}
