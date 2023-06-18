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
    public static final String OAUTH_SECURITY_TYPE = "oauth";
    public static final String SAML_SECURITY_TYPE = "saml";

    // saml config properties
    public static final String SAML_SP_ENTITY_ID_PROPERTY = "saml.sp.entityid";
    public static final String SAML_SIGNING_CERTIFICAT_FILE_PROPERTY = "saml.signing.cert.file";
    public static final String SAML_SIGNING_KEY_FILE_PROPERTY = "saml.signing.key.file";
    public static final String SAML_IDP_URL_PROPERTY = "saml.idp.url";
 
    // ouath config properties
    public static final String OAUTH_ISSUER_LOCATION_URL_PROPERTY = "oauth.issuer.location.url";
    public static final String OAUTH_CLIENT_SECRET_PROPERTY = "oauth.client.secret";
    public static final String OAUTH_CLIENT_ID_PROPERTY = "oauth.client.id";
    
    
    
    
    
    
    
    public static final String NONE = "none";
}
