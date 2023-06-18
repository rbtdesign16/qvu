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
    public static final String OAUTH_CLIENT_REGISTRATION_ID_PROPERTY = "oauth.client.registration.id";
    public static final String OAUTH_CLIENT_ID_PROPERTY = "oauth.client.id";
    public static final String OAUTH_CLIENT_SECRET_PROPERTY = "oauth.client.secret";
    public static final String OAUTH_CLIENT_AUTH_METHOD_PROPERTY = "oauth.client.auth.method";
    public static final String OAUTH_GRANT_TYPE_PROPERTY = "oauth.grant.type";
    public static final String OAUTH_REDIRECT_URI_PROPERTY = "oauth.redirect.uri";
    public static final String OAUTH_SCOPE_PROPERTY = "oauth.scope";
    public static final String OAUTH_AUTH_URI_PROPERTY = "oauth.auth.uri";
    public static final String OAUTH_TOKEN_URI_PROPERTY = "oauth.token.uri";
    public static final String OAUTH_USERINFO_URI_PROPERTY = "oauth.userinfo.uri";
    public static final String OAUTH_USER_NAME_ATT_NAME_PROPERTY = "oauth.user.name.att.name";
    public static final String OAUTH_JWK_SET_PROPERTY = "oauth.jwk.set.uri";    
    public static final String OAUTH_CLIENT_NAME_PROPERTY = "oauth.client.name";
    
    
    
    
    
    
    
    public static final String NONE = "none";
}
