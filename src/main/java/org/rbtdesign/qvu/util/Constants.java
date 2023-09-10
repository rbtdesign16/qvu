/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.util;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.rbtdesign.qvu.client.utils.Role;

/**
 *
 * @author rbtuc
 */
public class Constants {
    public static final SimpleDateFormat FILE_TS_FORMAT = new SimpleDateFormat("yyyyMMddHHmm");
    public static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    public static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    // security authentication types supported
    public static final String BASIC_SECURITY_TYPE = "basic";
    public static final String OIDC_SECURITY_TYPE = "oidc";
    
    public static final String[] SECURITY_TYPES = {BASIC_SECURITY_TYPE, OIDC_SECURITY_TYPE}; 
    public static final int DEFAULT_PIXELS_PER_CHARACTER = 12;
    public static final int DEFAULT_ROW_NUMBER_WIDTH = 6;
    
    public static final String DEFAULT_ADMINISTRATOR_ROLE = "administrator";
    public static final String DEFAULT_QUERY_DESIGNER_ROLE = "query designer";
    public static final String DEFAULT_REPORT_DESIGNER_ROLE = "report designer";
    public static final String DEFAULT_USER_ROLE = "user";
    
    public static final String DEFAULT_ADMIN_USER = "admin";
    public static final String SECURITY_TYPE_PROPERTY = "security.type";
    
    public static final String OFFLINE = "offline";
    public static final String ONLINE = "online";
    public static final String NONE = "none";
    
    public static final String OIDC_REGISTRATION_ID = "qvuoidc";
    public static final String OIDC_REDIRECT_TEMPLATE = "{baseUrl}/login/oauth2/code/{registrationId}";
    public static final int DEFAULT_MAX_EXPORTED_KEY_DEPTH = 4;
    public static final int DEFAULT_MAX_IMPORTED_KEY_DEPTH = 2;

    public static final String OAUTH2_CLAIM_ATTRIBUTE_REAL_ACCESS = "realm_access";

    public static final String SECURITY_CONFIG_FILE_NAME = "qvu-security.json";
    public static final String DATASOURCES_CONFIG_FILE_NAME = "qvu-datasources.json";
    public static final String DOCUMENT_GROUPS_CONFIG_FILE_NAME = "qvu-document-groups.json";
    public static final String LANGUAGE_FILE_NAME = "qvu-language.json";
    public static final String DEFAULT_CERT_FILE_NAME = "qvu-self-signed.p12";
    public static final String DEFAULT_LANGUAGE_KEY = "en-US";
    
    public static final String[] DEFAULT_ROLE_NAMES = {
        "administrator",
        "query designer",
        "report designer",
        "user"};

    public static final List<Role> DEFAULT_ROLES = new ArrayList<>();
    public static final Set<String> LAST_NAME_ATTRIBUTES = new HashSet<>();
    public static final Set<String> FIRST_NAME_ATTRIBUTES = new HashSet<>();

    static {
        for (String roleName : DEFAULT_ROLE_NAMES) {
            Role ri = new Role();
            ri.setName(roleName);
            ri.setDescription("base application role");
            DEFAULT_ROLES.add(ri);
        }
    }
    
    public static final String DOCUMENT_TYPE_QUERY = "query";
    public static final String DOCUMENT_TYPE_REPORT = "report";
    public static final String TABLE_CACHE_NAME = "table.cache";
    public static final String TABLE_SETTINGS_CACHE_NAME = "table.settings.cache";
    public static final int TABLE_CACHE_ENTRIES = 200;
    
    public static final String QUERY_DOCUMENT_CACHE_NAME = "query.document.cache";
    public static final int QUERY_DOCUMENT_CACHE_ENTRIES = 50;

    public static final String INNER_JOIN = "inner";
    public static final String OUTER_JOIN = "outer";
    
    public static final String IMPORTED_FOREIGN_KEY_TYPE = "imported";
    public static final String EXPORTED_FOREIGN_KEY_TYPE = "exported";
}
