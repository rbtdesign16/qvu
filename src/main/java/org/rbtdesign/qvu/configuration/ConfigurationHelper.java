package org.rbtdesign.qvu.configuration;

import org.rbtdesign.qvu.util.ConfigBuilder;
import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.configuration.database.DataSourcesConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentGroupsConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentSchedulesConfiguration;
import org.rbtdesign.qvu.configuration.security.SecurityConfiguration;
import org.rbtdesign.qvu.dto.SSLConfig;
import org.rbtdesign.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component("config")
public class ConfigurationHelper {
    private static final Logger LOG = LoggerFactory.getLogger(QvuConfiguration.class);
   
    @Value("#{systemProperties['repository.folder'] ?: ''}")
    private String repositoryFolder;

    @Value("${security.type:basic}")
    private String securityType;

    private String backupFolder;
    private SSLConfig sslConfig;
    private int serverPort;
    private String corsAllowedOrigins;
    private String defaultPageOrientation;
    private String defaultPageSize;
    private String defaultPageUnits;
    private List<Double> defaultPageBorder;
    private Double defaultHeaderHeight;
    private Double defaultFooterHeight;
    private List<Integer> defaultFontSizes;
    private List<String> defaultFonts;
 
    private SecurityConfiguration securityConfig;
    private DataSourcesConfiguration datasourcesConfig;
    private DocumentGroupsConfiguration documentGroupsConfig;
    private DocumentSchedulesConfiguration documentSchedulesConfig;
    private Map<String, Map<String, String>> langResources = new HashMap<>();
    private boolean initializingApplication;

    @PostConstruct
    private void init() {
        LOG.info("in Config.init()");
         
        System.setProperty("log.folder", repositoryFolder + "/logs");
        
        try {
            // indicates initial setup required
            if (StringUtils.isEmpty(repositoryFolder)) {
                initializingApplication = true;
                LOG.info("inital setup is required");
            } else {
                LOG.info("repository.folder=" + repositoryFolder);
                LOG.info("security.type=" + securityType);
            }
            
            loadConfiguration(initializingApplication);

            if (securityConfig == null) {
                throw new Exception("failed to load security configuration");
            } 

            
            securityConfig.postConstruct();
            datasourcesConfig.postConstruct();

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

    }

    public void loadConfiguration(boolean initialize) throws Exception {
        if (initialize) {
            securityConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-security-configuration.json"), SecurityConfiguration.class);
            datasourcesConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-datasource-configuration.json"), DataSourcesConfiguration.class);
            langResources = ConfigBuilder.build(getClass().getResourceAsStream("/initial-language.json"), langResources.getClass());
            documentGroupsConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-document-groups.json"), DocumentGroupsConfiguration.class);
            documentSchedulesConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-document-schedules.json"), DocumentSchedulesConfiguration.class);
        } else {
            langResources = ConfigBuilder.build(getLanguageFileName(), langResources.getClass());
            securityConfig = ConfigBuilder.build(getSecurityConfigurationFileName(), SecurityConfiguration.class);
            datasourcesConfig = ConfigBuilder.build(getDatasourceConfigurationFileName(), DataSourcesConfiguration.class);
            documentGroupsConfig = ConfigBuilder.build(getDocumentGroupsConfigurationFileName(), DocumentGroupsConfiguration.class);
            documentSchedulesConfig = ConfigBuilder.build(getDocumentSchedulesConfigurationFileName(), DocumentSchedulesConfiguration.class);
        }
    }
    
    public String getSecurityConfigurationFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.SECURITY_CONFIG_FILE_NAME;
    }

    public String getDatasourceConfigurationFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.DATASOURCES_CONFIG_FILE_NAME;
    }

    public String getDocumentGroupsConfigurationFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.DOCUMENT_GROUPS_CONFIG_FILE_NAME;
    }
    
    public String getDocumentSchedulesConfigurationFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.DOCUMENT_SCHEDULES_CONFIG_FILE_NAME;
    }

    
    public String getApplicationPropertiesFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + "application.properties";
    }

    public String getSchedulerPropertiesFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + "scheduler.properties";
    }

    public File getDocumentsFolder() {
        File retval = new File(repositoryFolder + File.separator + "documents");
        if (!retval.exists()) {
            retval.mkdirs();
        }
        
        return retval;
    }
    
    public File getDocumentGroupsFolder(String groupName, String user) {
        File documents = getDocumentsFolder();
        
        String groupPath;
        
        if (Constants.DEFAULT_DOCUMENT_GROUP.equals(groupName)) {
            groupPath = groupName + File.separator + user;
        } else {
            groupPath = groupName;
        }
        
        File retval = new File(documents.getPath() + File.separator + groupPath);
        if (!retval.exists()) {
            retval.mkdirs();
        }
        
        return retval;
    }


    public SecurityConfiguration getSecurityConfig() {
        return securityConfig;
    }

    public DataSourcesConfiguration getDatasourcesConfig() {
        return datasourcesConfig;
    }

    public DocumentGroupsConfiguration getDocumentGroupsConfig() {
        return documentGroupsConfig;
    }

    public DocumentSchedulesConfiguration getDocumentSchedulesConfig() {
        return documentSchedulesConfig;
    }

    public String getSecurityType() {
        return securityType;
    }

    public Map<String, Map<String, String>> getLangResources() {
        return langResources;
    }

    public String getRepositoryFolder() {
        return repositoryFolder;
    }

    public boolean isInitializingApplication() {
        return initializingApplication;
    }

    public void setDatasourcesConfig(DataSourcesConfiguration datasourcesConfig) {
        this.datasourcesConfig = datasourcesConfig;
    }

    public void setDocumentGroupsConfig(DocumentGroupsConfiguration documentGroupsConfig) {
        this.documentGroupsConfig = documentGroupsConfig;
    }
    
    public void setDocumentSchedulesConfig(DocumentSchedulesConfiguration documentSchedulesConfig) {
        this.documentSchedulesConfig = documentSchedulesConfig;
    }

    public void setSecurityConfig(SecurityConfiguration securityConfig) {
        this.securityConfig = securityConfig;
    }

    public String getLanguageText(String langKey, String textKey) {
        String retval = textKey;
        try {
            Map<String, String> l = langResources.get(langKey);

            if (l != null) {
                retval = l.get(textKey);
            }

            if (StringUtils.isEmpty(retval)) {
                retval = textKey;
            }
        } catch (Exception ex) {
            LOG.warn(ex.toString(), ex);
        }

        return retval;
    }

    public String getLanguageText(String langKey, String textKey, String replace) {
        return getLanguageText(langKey, textKey, new String[] {replace});
    }

    public String getLanguageText(String langKey, String textKey, String[] replace) {
        String retval = getLanguageText(langKey, textKey);
        
        for (int i = 0; i < replace.length; ++i) {
            retval = retval.replace("$" + (i+1), replace[i]);
        }
        
        return retval;
    }
    
    public String getLanguageFileName() {
        return repositoryFolder + File.separator + "config" + File.separator + Constants.LANGUAGE_FILE_NAME;
    }

    public void setRepositoryFolder(String repositoryFolder) {
        this.repositoryFolder = repositoryFolder;
    }

    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }

    public File getHelpFolder() {
        return new File(repositoryFolder + File.separator + "help");
    }

    public String getBackupFolder() {
        return backupFolder;
    }

    public void setBackupFolder(String backupFolder) {
        this.backupFolder = backupFolder;
    }
    
    public void setSslConfig(SSLConfig sslConfig) {
        this.sslConfig = sslConfig;
    }
    
    public SSLConfig getSslConfig() {
        return sslConfig;
    }
    
    public int getServerPort() {
        return serverPort;
    }
    
    public void setServerPort(int serverPort) {
        this.serverPort = serverPort;
    }
    
    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }
    
    public void setCorsAllowedOrigins(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    public String getDefaultPageOrientation() {
        return defaultPageOrientation;
    }

    public void setDefaultPageOrientation(String defaultPageOrientation) {
        this.defaultPageOrientation = defaultPageOrientation;
    }

    public String getDefaultPageSize() {
        return defaultPageSize;
    }

    public void setDefaultPageSize(String defaultPageSize) {
        this.defaultPageSize = defaultPageSize;
    }

    public String getDefaultPageUnits() {
        return defaultPageUnits;
    }

    public void setDefaultPageUnits(String defaultPageUnits) {
        this.defaultPageUnits = defaultPageUnits;
    }

    public List<Double> getDefaultPageBorder() {
        return defaultPageBorder;
    }

    public void setDefaultPageBorder(List<Double> defaultPageBorder) {
        this.defaultPageBorder = defaultPageBorder;
    }

    public Double getDefaultHeaderHeight() {
        return defaultHeaderHeight;
    }

    public void setDefaultHeaderHeight(Double defaultHeaderHeight) {
        this.defaultHeaderHeight = defaultHeaderHeight;
    }

    public Double getDefaultFooterHeight() {
        return defaultFooterHeight;
    }

    public void setDefaultFooterHeight(Double defaultFooterHeight) {
        this.defaultFooterHeight = defaultFooterHeight;
    }

    public List<Integer> getDefaultFontSizes() {
        return defaultFontSizes;
    }

    public void setDefaultFontSizes(List<Integer> defaultFontSizes) {
        this.defaultFontSizes = defaultFontSizes;
    }

    public List<String> getDefaultFonts() {
        return defaultFonts;
    }

    public void setDefaultFonts(List<String> defaultFonts) {
        this.defaultFonts = defaultFonts;
    }
    
    
 }
