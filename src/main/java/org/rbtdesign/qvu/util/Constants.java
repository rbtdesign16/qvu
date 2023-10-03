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
    public static final String SERVER_PORT_PROPERTY = "server.port";
    public static final String BACKUP_FOLDER_PROPERTY = "backup.folder";
    public static final String CORS_ALLOWED_ORIGINS_PROPERTY = "cors.allowed.origins";
    
    public static final String SSL_ENABLED_PROPERTY = "server.ssl.enabled";
    public static final String SSL_KEYSTORE_PROPERTY = "server.ssl.key-store";
    public static final String SSL_KEYSTORE_TYPE_PROPERTY = "server.ssl.key-store-type";
    public static final String SSL_KEY_ALIAS_PROPERTY = "server.ssl.key-alias";
    public static final String SSL_KEYSTORE_PASSWORD_PROPERTY = "server.ssl.key-store-password";
    public static final String SSL_KEY_PASSWORD_PROPERTY = "server.ssl.key-password";
    
    public static final String[] SSL_PROPERTIES = {
        SSL_ENABLED_PROPERTY,
        SSL_KEYSTORE_PROPERTY,
        SSL_KEYSTORE_TYPE_PROPERTY,
        SSL_KEY_ALIAS_PROPERTY,
        SSL_KEYSTORE_PASSWORD_PROPERTY,
        SSL_KEY_PASSWORD_PROPERTY};
    
    
    public static final String SCHEDULER_ENABLED_PROPERTY = "scheduler.enabled";
    public static final String SCHEDULER_FIXED_RATE_SECONDS_PROPERTY = "scheduler.fixed.rate.seconds";
    public static final String SCHEDULER_MAX_SCHEDULER_POOL_PROPERTY = "max.scheduler.pool.size";
    public static final String SCHEDULER_EXECUTE_TIMEOUT_PROPERTY = "scheduler.execute.timeout.seconds";
    public static final String MAIL_SMTP_AUTH_PROPERTY = "mail.smtp.auth";
    public static final String MAIL_SMTP_STARTTLS_ENABLE_PROPERTY = "mail.smtp.starttls.enable";
    public static final String MAIL_SMTP_HOST_PROPERTY = "mail.smtp.host";
    public static final String MAIL_SMTP_PORT_PROPERTY = "mail.smtp.port";
    public static final String MAIL_SMTP_SSL_TRUST_PROPERTY = "mail.smtp.ssl.trust";
    public static final String MAIL_USER_PROPERTY = "mail.user";
    public static final String MAIL_PASSWORD_PROPERTY = "mail.password";
    public static final String MAIL_FROM_PROPERTY = "mail.from";
    public static final String MAIL_SUBJECT_PROPERTY = "mail.subject";
    public static final String DEFAULT_SCHEDULER_FIXED_RATE_SECONDS = "30";
    
    public static final String[] SCHEDULER_PROPERTIES = {
        SCHEDULER_ENABLED_PROPERTY,
        SCHEDULER_FIXED_RATE_SECONDS_PROPERTY,
        SCHEDULER_MAX_SCHEDULER_POOL_PROPERTY,
        SCHEDULER_EXECUTE_TIMEOUT_PROPERTY,
        MAIL_SMTP_AUTH_PROPERTY,
        MAIL_SMTP_STARTTLS_ENABLE_PROPERTY,
        MAIL_SMTP_SSL_TRUST_PROPERTY,
        MAIL_SMTP_HOST_PROPERTY,
        MAIL_SMTP_PORT_PROPERTY,
        MAIL_USER_PROPERTY,
        MAIL_PASSWORD_PROPERTY,
        MAIL_FROM_PROPERTY,
        MAIL_SUBJECT_PROPERTY};

    public static final String OIDC_REGISTRATION_ID = "qvuoidc";
    public static final String OIDC_REDIRECT_TEMPLATE = "{baseUrl}/login/oauth2/code/{registrationId}";
    public static final int DEFAULT_MAX_EXPORTED_KEY_DEPTH = 4;
    public static final int DEFAULT_MAX_IMPORTED_KEY_DEPTH = 2;

    public static final String OAUTH2_CLAIM_ATTRIBUTE_REAL_ACCESS = "realm_access";

    public static final String SECURITY_CONFIG_FILE_NAME = "qvu-security.json";
    public static final String DATASOURCES_CONFIG_FILE_NAME = "qvu-datasources.json";
    public static final String DOCUMENT_GROUPS_CONFIG_FILE_NAME = "qvu-document-groups.json";
    public static final String DOCUMENT_SCHEDULES_CONFIG_FILE_NAME = "qvu-document-schedules.json";
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
    
    public static final String DEFAULT_DOCUMENT_GROUP = "user";
    public static final String DEFAULT_DOCUMENT_GROUP_DESCRIPTION = "current user document group";
    
    public static final String CUSTOM_FK_DATA_SEPARATOR = "?";
    public static final String COMPARISON_OPERATOR_IN = "in";
    public static final String TABLE_TYPE_VIEW = "VIEW";
    
    public static final String RESULT_TYPE_EXCEL = "excel";
    public static final String RESULT_TYPE_CSV = "csv";
    public static final String RESULT_TYPE_JSON_FLAT = "jsonflat";
    public static final String RESULT_TYPE_JSON_OBJECTGRAPH = "jsonobjectgraph";
    
    public static final String CURRENT_DATE_PLACEHOLDER = "$dt";
    
    
}
