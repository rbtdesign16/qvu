/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.ArrayList;
import java.util.List;
import org.rbt.qvu.client.utils.RoleInformation;

/**
 *
 * @author rbtuc
 */
public class Constants {
    // environment variables for ecternal config 
    public static final String SECURITY_TYPE_PROPERTY = "QVU_SECURITY_TYPE";

    // security authentication types supported
    public static final String BASIC_SECURITY_TYPE = "basic";
    public static final String OIDC_SECURITY_TYPE = "oidc";
    public static final String SAML_SECURITY_TYPE = "saml";
    public static final String DEFAULT_ROLE_ATTRIBUTE_NAME = "role";
    public static final String PASSWORD_ATTRIBUTE_NAME = "password";

    
    public static final String OFFLINE = "offline";
    public static final String ONLINE = "online";
    public static final String NONE = "none";
    
   public static final String[] PREDEFINED_ROLE_NAMES = {
        "administrator", 
        "query designer", 
        "report designer",
        "user"};
   
   public static final List<RoleInformation> PREDEFINED_ROLES = new ArrayList<>();
   
   static {
       for (String roleName : PREDEFINED_ROLE_NAMES) {
           RoleInformation ri = new RoleInformation();
           ri.setName(roleName);
           ri.setDescription("qvu " + roleName);
           PREDEFINED_ROLES.add(ri);
       }
   }
}
