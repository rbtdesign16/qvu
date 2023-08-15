/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import org.rbt.qvu.util.ConfigBuilder;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
import org.rbt.qvu.configuration.document.DocumentGroupsConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.util.Constants;
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
    private static final String DEFAULT_DOCUMENT_GROUPS = "{\"lastUpdated\": null, \"documentGroups\": [{\"name\": \"general\", \"description\": \"default document group\", \"defaultGroup\": true, \"roles\":[]}]}";
    
    @Value("#{systemProperties['repository.folder'] ?: '-'}")
    private String repositoryFolder;

    @Value("#{systemProperties['security.type'] ?: 'basic'}")
    private String securityType;

    private SecurityConfiguration securityConfig;
    private DataSourcesConfiguration datasourcesConfig;
    private DocumentGroupsConfiguration documentGroupsConfig;
    private Map<String, Map<String, String>> langResources = new HashMap<>();
    private boolean initialSetupRequired;

    @PostConstruct
    private void init() {
        LOG.info(" in Config.init()");
        try {
            initialSetupRequired = "-".equals(repositoryFolder);

            // indicates initial setup required
            if (initialSetupRequired) {
                securityConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-security-configuration.json"), SecurityConfiguration.class);
                datasourcesConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-datasource-configuration.json"), DataSourcesConfiguration.class);
                langResources = ConfigBuilder.build(getClass().getResourceAsStream("/initial-language.json"), langResources.getClass());
            } else {
                loadConfiguration();
            }
            
            if (securityConfig == null) {
                throw new Exception("failed to load security configuration");
            } else {
                securityConfig.setSecurityType(securityType);
            }

            LOG.info("repository.folder=" + repositoryFolder);
            LOG.info("security.type=" + securityType);
            LOG.info("inital setup required: " + initialSetupRequired);
            
            securityConfig.postConstruct();
            datasourcesConfig.postConstruct();

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

    }

    public void loadConfiguration() throws Exception {
        langResources = ConfigBuilder.build(getLanguageFileName(), langResources.getClass());
        securityConfig = ConfigBuilder.build(getSecurityConfigurationFileName(), SecurityConfiguration.class);
        
        datasourcesConfig = ConfigBuilder.build(getDatasourceConfigurationFileName(), DataSourcesConfiguration.class);
        
        String dgfile = getDocumentGroupsConfigurationFileName();
        File f = new File(dgfile);
        
        // if document groups file does not exist initialze it
        if (!f.exists()) {
            f.getParentFile().mkdirs();
            FileUtils.write(f, DEFAULT_DOCUMENT_GROUPS, "UTF-8");
        }
        
        documentGroupsConfig = ConfigBuilder.build(dgfile, DocumentGroupsConfiguration.class);
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

    public File getDocumentsFolder() {
        File retval = new File(repositoryFolder + File.separator + "documents");
        if (!retval.exists()) {
            retval.mkdirs();
        }
        
        return retval;
    }
    
    public File getDocumentGroupsFolder(String groupName) {
        File documents = getDocumentsFolder();
        
        File retval = new File(documents.getPath() + File.separator + groupName);
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

    public String getSecurityType() {
        return securityConfig.getSecurityType();
    }

    public Map<String, Map<String, String>> getLangResources() {
        return langResources;
    }

    public String getRepositoryFolder() {
        return repositoryFolder;
    }

    public boolean isInitialSetupRequired() {
        return initialSetupRequired;
    }

    public void setDatasourcesConfig(DataSourcesConfiguration datasourcesConfig) {
        this.datasourcesConfig = datasourcesConfig;
    }

    public void setDocumentGroupsConfig(DocumentGroupsConfiguration documentGroupsConfig) {
        this.documentGroupsConfig = documentGroupsConfig;
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

    public String getQueryDocumentsFolder() {
        return repositoryFolder + File.separator + "query-documents";
    }

    public String getReportDocumentsFolder() {
        return repositoryFolder + File.separator + "report-documents";
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

    
}
