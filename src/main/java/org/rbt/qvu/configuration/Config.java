/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

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

    @Value("#{environment.QVU_SECURITY_TYPE}")
    private String securityType;

    @Value("#{environment.QVU_CONFIG_FILE}")
    private String applicationConfigFile;

    private ApplicationConfiguration appConfig;
    private SecurityConfiguration securityConfig;
    private DataSourcesConfiguration datasourcesConfig;

    @PostConstruct
    private void init() {
        LOG.info(" in Config.ini()");
        LOG.info("applicationConfigFile=" + applicationConfigFile);
        try {
            appConfig = ConfigBuilder.build(applicationConfigFile, ApplicationConfiguration.class);
            System.setProperty(Constants.SECURITY_TYPE_PROPERTY, appConfig.getSecurityType());
            securityConfig = ConfigBuilder.build(appConfig.getSecurityConfigurationFile(), SecurityConfiguration.class);
            securityConfig.setSecurityType(securityType);
            appConfig.setSecurityType(securityType);
            datasourcesConfig = ConfigBuilder.build(appConfig.getDatabaseConfigurationFile(), DataSourcesConfiguration.class);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

    }
    public ApplicationConfiguration getAppConfig() {
        return appConfig;
    }

    public void setAppConfig(ApplicationConfiguration appConfig) {
        this.appConfig = appConfig;
    }

    public SecurityConfiguration getSecurityConfig() {
        return securityConfig;
    }

    public synchronized void setSecurityConfig(SecurityConfiguration securityConfig) {
        this.securityConfig = securityConfig;
    }

    public DataSourcesConfiguration getDatasourcesConfig() {
        return datasourcesConfig;
    }

    public synchronized void setDatasourcesConfig(DataSourcesConfiguration datasourcesConfig) {
        this.datasourcesConfig = datasourcesConfig;
    }
}
