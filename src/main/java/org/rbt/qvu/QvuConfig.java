package org.rbt.qvu;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.StringTokenizer;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Messages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@EnableWebMvc
@Configuration
@ComponentScan({"org.rbt.qvu"})
@PropertySource("classpath:application.properties")
public class QvuConfig implements WebMvcConfigurer {
    private static Logger LOG = LoggerFactory.getLogger(QvuConfig.class);
    private Map<String, HikariConfig> dbPoolConfig = new HashMap<>();
    private Map<String, HikariDataSource> dbDataSources = new HashMap<>();

    @Value("${database.config}")
    private String databaseConfigFile;

    @PostConstruct
    private void initializeConnectionPools() {
        try (InputStream is = new FileInputStream(databaseConfigFile)) {
            Properties p = new Properties();
            p.load(is);

            String datasources = p.getProperty(Constants.DB_DATASOURCES_PROPERTY);
            if (StringUtils.isEmpty(datasources)) {
                throw new Exception(Messages.INVALID_DATABASE_CONFIGURATION_NO_DATASOURCES);
            }

            StringTokenizer st = new StringTokenizer(datasources, ",");

            while (st.hasMoreTokens()) {
                String ds = st.nextToken().trim();
                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(p.getProperty(ds + ".dburl"));
                config.setUsername(p.getProperty(ds + ".dbusername"));
                config.setPassword(p.getProperty(ds + ".dbpassword"));
                config.setDriverClassName(p.getProperty(ds + ".dbdriver"));

                String connectionTimeout = p.getProperty(ds + ".connecton.timeout");
                String idleTimeout = p.getProperty(ds + ".idle.timeout");
                String maxLifeTime = p.getProperty(ds + ".max.lifetime");
                String maxPoolSize = p.getProperty(ds + ".max.poolsize");

                if (StringUtils.isNotEmpty(connectionTimeout)) {
                    config.setConnectionTimeout(Long.parseLong(connectionTimeout));
                }

                if (StringUtils.isNotEmpty(idleTimeout)) {
                    config.setIdleTimeout(Long.parseLong(idleTimeout));
                }

                if (StringUtils.isNotEmpty(maxLifeTime)) {
                    config.setMaxLifetime(Long.parseLong(maxLifeTime));
                }

                if (StringUtils.isNotEmpty(maxPoolSize)) {
                    config.setMaximumPoolSize(Integer.parseInt(maxPoolSize));
                }

                dbPoolConfig.put(ds, config);
                dbDataSources.put(ds, new HikariDataSource(config));
            }

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    @Bean
    public DataSource getDataSource(String name) {
        return dbDataSources.get(name);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("/index");
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }
}
