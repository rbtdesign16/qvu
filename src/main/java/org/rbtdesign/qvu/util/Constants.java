package org.rbtdesign.qvu.util;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

    public static final String DEFAULT_PAGE_SIZE_PROPERTY = "default.page.size";
    public static final String DEFAULT_PAGE_ORIENTATION_PROPERTY = "default.page.orientation";
    public static final String DEFAULT_PAGE_UNITS_PROPERTY = "default.page.units";
    
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

    public static final String REPORT_DOCUMENT_CACHE_NAME = "report.document.cache";
    public static final int REPORT_DOCUMENT_CACHE_ENTRIES = 50;

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
    
    public static final String PAGE_ORIENTATION_LANDSCAPE = "landscape";
    public static final String PAGE_ORIENTATION_PORTRAIT = "portrait";
    
    public static final String[] PAGE_ORIENTATIONS = {
        PAGE_ORIENTATION_PORTRAIT,
        PAGE_ORIENTATION_LANDSCAPE
    };
    
    public static final String[] PAGE_SIZE_NAMES = {
        "letter", 
        "legal", 
        "tabloid",
        "4A0",
        "2A0",
        "A0",
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "A8",
        "A9",
        "A10",
        "B0",
        "B1",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "B7",
        "B8",
        "B9",
        "B10",
        "C0",
        "C1",
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7"};
    
    public static final Map<String, double[]> PAGE_SIZE_MAP = new HashMap<>();
    
    // page size mm-width, mm-height, inch-width, inch.height
    static {
        PAGE_SIZE_MAP.put("letter", new double[] {215.9, 279.4, 8.5, 11});
        PAGE_SIZE_MAP.put("legal", new double[] {215.9, 355.6, 8.5, 14});
        PAGE_SIZE_MAP.put("tabloid", new double[] {279.4, 431.8, 11, 17});
        PAGE_SIZE_MAP.put("4A0", new double[] {1582, 2378,66.22, 93.62});
        PAGE_SIZE_MAP.put("2A0", new double[] {1189 , 168, 46.81, 66.22});
        PAGE_SIZE_MAP.put("A0", new double[] {841, 1189, 33, 46.81});
        PAGE_SIZE_MAP.put("A1", new double[] {594, 841, 23.39, 33});
        PAGE_SIZE_MAP.put("A2", new double[] {420, 594, 16.54, 23.36});
        PAGE_SIZE_MAP.put("A3", new double[] {297, 420, 11.69, 16.54});
        PAGE_SIZE_MAP.put("A4", new double[] {210, 297, 8.27, 11.69});
        PAGE_SIZE_MAP.put("A5", new double[] {148, 210, 5.83, 8.27});
        PAGE_SIZE_MAP.put("A6", new double[] {105, 148, 4.13, 5.83});
        PAGE_SIZE_MAP.put("A7", new double[] {74 , 105, 2.91, 4.13});
        PAGE_SIZE_MAP.put("A8", new double[] {52, 74, 2.05, 2.91});
        PAGE_SIZE_MAP.put("A9", new double[] {37, 52, 1.46, 2.05});
        PAGE_SIZE_MAP.put("A10", new double[] {26, 37, 1.02, 1.46});
        PAGE_SIZE_MAP.put("B0", new double[] {1000, 1414, 33.37, 55.67});
        PAGE_SIZE_MAP.put("B1", new double[] {707, 1000, 27.84, 39.37});
        PAGE_SIZE_MAP.put("B2", new double[] {500, 707,	19.69, 27.84});
        PAGE_SIZE_MAP.put("B3", new double[] {353, 500, 13.9, 19.69});
        PAGE_SIZE_MAP.put("B4", new double[] {250, 352, 9.84, 13.9});
        PAGE_SIZE_MAP.put("B5", new double[] {176, 250, 6.93, 9.84});
        PAGE_SIZE_MAP.put("B6", new double[] {125, 176, 4.92, 6.93});
        PAGE_SIZE_MAP.put("B7", new double[] {88, 125, 3.47, 4.92});
        PAGE_SIZE_MAP.put("B8", new double[] {62, 88, 2.44, 3.47});
        PAGE_SIZE_MAP.put("B9", new double[] {44, 62, 1.73, 2.44});
        PAGE_SIZE_MAP.put("B10", new double[] {31, 44, 1.22, 1.73});
        PAGE_SIZE_MAP.put("C0", new double[] {917, 1297, 36.12, 51.6});
        PAGE_SIZE_MAP.put("C1", new double[] {648, 917, 25.50, 36.12});
        PAGE_SIZE_MAP.put("C2", new double[] {458, 648, 18, 25.50});
        PAGE_SIZE_MAP.put("C3", new double[] {324, 458, 12.75, 18});
        PAGE_SIZE_MAP.put("C4", new double[] {229, 324, 9, 12.75});
        PAGE_SIZE_MAP.put("C5", new double[] {162, 229, 6.38, 9});
        PAGE_SIZE_MAP.put("C6", new double[] {114, 162, 4.5, 6.38});
        PAGE_SIZE_MAP.put("C7", new double[] {81, 114, 3.19, 4.5});
        PAGE_SIZE_MAP.put("DL", new double[] {110, 220, 4.32, 8.69});
    }
    
    public static final String DEFAULT_PAGE_SIZE = "letter";

    public static final String[] PAGE_UNITS = {"inch", "mm"};
    public static final String DEFAULT_PAGE_UNITS = "inch";
    public static final String REPORT_LOCATION_HEADER = "header";
    public static final String REPORT_LOCATION_BODY = "body";
    public static final String REPORT_LOCATION_FOOTER = "footer";
    public static final double DEFAULT_REPORT_BORDER_WIDTH = 0.5;
    public static final Double DEFAULT_HEADER_HEIGHT = 1.0;
    public static final Double DEFAULT_FOOTER_HEIGHT = 1.0;
    public static final Double[] DEFAULT_PAGE_BORDER = {0.5, 0.5, 0.5, 0.5};
    
    public static final String[] REPORT_LOCATIONS = {
        REPORT_LOCATION_HEADER,
        REPORT_LOCATION_BODY,
        REPORT_LOCATION_FOOTER
    };
    
    public static final String REPORT_OBJECT_TYPE_TEXT = "text";
    public static final String REPORT_OBJECT_TYPE_IMAGE = "image";
    public static final String REPORT_OBJECT_TYPE_HYPERLINK = "hyperlink";
    public static final String REPORT_OBJECT_TYPE_PAGE_NUMBER = "page number";
    public static final String REPORT_OBJECT_TYPE_CURRENT_DATE = "current date";
    public static final String REPORT_OBJECT_TYPE_DATA_GRID = "data grid";
    public static final String REPORT_OBJECT_TYPE_DATA_FIELD = "data field";
    public static final String REPORT_OBJECT_TYPE_DATA_RECORD = "data record";
    public static final String REPORT_OBJECT_TYPE_GRAPH = "graph";
    public static final String REPORT_OBJECT_TYPE_SUBREPORT = "subreport";
    
    public static final String[] REPORT_OBJECT_TYPES = {
        REPORT_OBJECT_TYPE_TEXT,
        REPORT_OBJECT_TYPE_IMAGE,
        REPORT_OBJECT_TYPE_HYPERLINK,
        REPORT_OBJECT_TYPE_PAGE_NUMBER,
        REPORT_OBJECT_TYPE_CURRENT_DATE,
        REPORT_OBJECT_TYPE_DATA_FIELD,
        REPORT_OBJECT_TYPE_DATA_GRID,
        REPORT_OBJECT_TYPE_DATA_RECORD,
        REPORT_OBJECT_TYPE_GRAPH,
        REPORT_OBJECT_TYPE_SUBREPORT
    };
        
    public static final String DEFAULT_FONT = "Arial";
    public static final int DEFAULT_FONT_SIZE = 12;
    public static final String DEFAULT_FONT_COLOR = "black";
}
