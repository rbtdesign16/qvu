/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

/**
 *
 * @author rbtuc
 */
public class Constants {

    public static final String DB_DATASOURCES_PROPERTY = "datasources";
    
    // environment variables for ecternal config 
    public static final String SECURITY_TYPE_PROPERTY = "QVU_SECURITY_TYPE";
    public static final String SECURITY_CONFIG_PROPERTY = "QVU_SECURITY_CONFIG_FILE";
    public static final String DATABASE_CONFIG_PROPERTY = "QVU_DB_CONFIG_FILE";

    // security authentication types supported
    public static final String BASIC_SECURITY_TYPE = "basic";
    public static final String OIDC_SECURITY_TYPE = "oidc";
    public static final String SAML_SECURITY_TYPE = "saml";

    public static final String PASSWORD_ATTRIBUTE_NAME = "password";

    
    public static final String NONE = "none";
}
