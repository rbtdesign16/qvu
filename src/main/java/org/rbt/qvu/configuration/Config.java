/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.rbt.qvu.SecurityConfig;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
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
public class Config {
    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${force.init:false}")
    private boolean forceInit;

    @Value("${repository.folder:-}")
    private String repositoryFolder;

    private ApplicationConfiguration appConfig;
    private SecurityConfiguration securityConfig;
    private DataSourcesConfiguration datasourcesConfig;
    private Map<String, Map<String, String>> langResources = new HashMap<>();
    private boolean initialSetupRequired;

    @PostConstruct
    private void init() {
        LOG.info(" in Config.ini()");
        LOG.info("repositoryFolder=" + repositoryFolder);
        try {
            // indicates initial setup required
            if ("-".equals(repositoryFolder) || forceInit) {
                initialSetupRequired = true;
                LOG.info("inital setup required");
                appConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-application-configuration.json"), ApplicationConfiguration.class);
                securityConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-security-configuration.json"), SecurityConfiguration.class);
                datasourcesConfig = ConfigBuilder.build(getClass().getResourceAsStream("/initial-datasource-configuration.json"), DataSourcesConfiguration.class);
                langResources = ConfigBuilder.build(getClass().getResourceAsStream("/initial-language.json"), langResources.getClass());
            } else {
                appConfig = ConfigBuilder.build(repositoryFolder + File.separator + Constants.APPLICATION_CONFIG_FILE_NAME, ApplicationConfiguration.class);
                langResources = ConfigBuilder.build(getClass().getResourceAsStream(appConfig.getLanguageFile()), langResources.getClass());
                securityConfig = ConfigBuilder.build(appConfig.getSecurityConfigurationFile(), SecurityConfiguration.class);
                datasourcesConfig = ConfigBuilder.build(appConfig.getDatasourceConfigurationFile(), DataSourcesConfiguration.class);
            }

            securityConfig.postConstruct();

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

    }

    public ApplicationConfiguration getAppConfig() {
        return appConfig;
    }

    public SecurityConfiguration getSecurityConfig() {
        return securityConfig;
    }

    public DataSourcesConfiguration getDatasourcesConfig() {
        return datasourcesConfig;
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

    public void setAppConfig(ApplicationConfiguration appConfig) {
        this.appConfig = appConfig;
    }

    public void setSecurityConfig(SecurityConfiguration securityConfig) {
        this.securityConfig = securityConfig;
    }
}
