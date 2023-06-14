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

@EnableWebMvc
@Configuration
@ComponentScan({ "org.rbt.jrdemo" })
@PropertySource("classpath:application.properties")
public class QvuConfig implements WebMvcConfigurer {
    private HikariConfig config = new HikariConfig();
    private HikariDataSource datasource;

    @Value("${spring.datasource.username}")
    private String dbusername;

    @Value("${spring.datasource.password}")
    private String dbpassword;

    @Value("${spring.datasource.driverClassName}") 
    private String dbdriver;

    @Value("${spring.datasource.url}")
    private String dburl;
 
    @PostConstruct
    private void initializeConnectionPool() {
        config.setJdbcUrl(dburl);
        config.setUsername(dbusername);
        config.setPassword(dbpassword);
        config.setDriverClassName(dbdriver);
        datasource = new HikariDataSource(config);
    }

    @Bean
    public DataSource getDataSource() {
        return datasource;
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
