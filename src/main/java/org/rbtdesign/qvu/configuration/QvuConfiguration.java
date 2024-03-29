package org.rbtdesign.qvu.configuration;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.configuration.security.BasicAuthSecurityProvider;
import org.rbtdesign.qvu.configuration.security.OidcConfiguration;
import org.rbtdesign.qvu.dto.SSLConfig;
import org.rbtdesign.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableScheduling
@PropertySources({
    @PropertySource(value = "classpath:default-application.properties"),
    @PropertySource(value = "file:${repository.folder}/config/application.properties", ignoreResourceNotFound = true)
})

public class QvuConfiguration {
    private static final Logger LOG = LoggerFactory.getLogger(QvuConfiguration.class);

    @Autowired
    private ConfigurationHelper config;

    @Value("${server.ssl.enabled:false}")
    private boolean sslEnabled;

    @Value("${server.ssl.key-store:}")
    private String sslKeyStore;

    @Value("${server.ssl.key-store-type:}")
    private String sslKeyStoreType;

    @Value("${server.ssl.key-alias:}")
    private String sslKeyAlias;
    
    @Value("${server.ssl.key-store-password:}")
    private String sslKeyStorePassword;

    @Value("${server.ssl.key-password:}")
    private String sslKeyPassword;

    @Value("${server.port}")
    private Integer serverPort;

    @Value("${server.servlet.context-path}")
    private String servletContextPath;

    @Value("${security.type}")
    private String securityType;
    
    @Value("${cors.allowed.origins:*}")
    private String corsAllowedOrigins;

    @Value("${backup.folder:}")
    private String backupFolder;

    @Value("${default.page.size:letter}")
    private String defaultPageSize;

    @Value("${default.page.orientation:portrait}")
    private String defaultPageOrientation;

    @Value("${default.page.units:inch}")
    private String defaultPageUnits;

    @Value("#{'${default.page.border:0.5,0.5,0.5,0.5}'.split(',')}")
    private List<Double> defaultPageBorder;

    @Value("${default.header.height:1}")
    private Double defaultHeaderHeight;

    @Value("${default.footer.height:1}")
    private Double defaultFooterHeight;

    @Value("#{'${default.font.sizes:8,9,10,11,12,14,16,18,20,22}'.split(',')}")
    private List<Integer> defaultFontSizes;

    @Value("${default.component.background.color:white}")
    private String defaultCompoenetBackgroundColor;
    
    @Value("${default.component.foreground.color:black}")
    private String defaultCompoenetForegroundColor;
    
    @Value("#{'${default.float.formats:}'.split('\\|')}")
    private List<String> defaultFloatFormats;

    @Value("#{'${default.int.formats:}'.split('\\|')}")
    private List<String> defaultIntFormats;

    @Value("#{'${default.date.formats:yyyy-MM-dd\\|yyyy-MM-dd HH:mm}'.split('\\|')}")
    private List<String> defaultDateFormats;

    @PostConstruct
    private void init() {
        LOG.info("in QvuConfiguration.init()");
        LOG.info("server.port=" + serverPort);
        LOG.info("backup.folder=" + backupFolder);
        LOG.info("server.servlet.context-path=" + servletContextPath);
        LOG.info("security.type=" + securityType);
        LOG.info("cors.allowed.origins=" + corsAllowedOrigins);
        config.setBackupFolder(backupFolder);
        config.setSslConfig(getSslConfig());
        config.setServerPort(serverPort);
        config.setCorsAllowedOrigins(corsAllowedOrigins);
        config.setDefaultPageOrientation(defaultPageOrientation);
        config.setDefaultPageSize(defaultPageSize);
        config.setDefaultPageUnits(defaultPageUnits);
        config.setDefaultPageBorder(defaultPageBorder);
        config.setDefaultHeaderHeight(defaultHeaderHeight);
        config.setDefaultFooterHeight(defaultFooterHeight);
        config.setDefaultFontSizes(defaultFontSizes);
        config.setDefaultComponentBackgroundColor(defaultCompoenetBackgroundColor);
        config.setDefaultComponentForegroundColor(defaultCompoenetForegroundColor);
        config.setDefaultFloatFormats(defaultFloatFormats);
        config.setDefaultIntFormats(defaultIntFormats);
        config.setDefaultDateFormats(defaultDateFormats);
    }

    @Autowired
    private BasicAuthSecurityProvider basicAuthProvider;

    @Bean
    @ConditionalOnExpression("'${security.type}'=='basic'")
    AuthenticationManager basicAuthManager(HttpSecurity http) throws Exception {
        LOG.debug("in basicAuthManager()");
        AuthenticationManagerBuilder authenticationManagerBuilder
                = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(basicAuthProvider);
        return authenticationManagerBuilder.build();
    }

    @Bean
    @ConditionalOnExpression("'${security.type}'=='oidc'")
    ClientRegistrationRepository oidcRepository() throws Exception {
        LOG.debug("in oidcRepository()");
        Set<String> scopes = new HashSet<>();
        scopes.add(OidcScopes.OPENID);
        scopes.add(OidcScopes.PROFILE);
        scopes.add(OidcScopes.EMAIL);

        OidcConfiguration oidcConfig = config.getSecurityConfig().getOidcConfiguration();
        ClientRegistration clientRegistration = ClientRegistrations
                .fromOidcIssuerLocation(oidcConfig.getIssuerLocationUrl())
                .scope(scopes)
                .registrationId(Constants.OIDC_REGISTRATION_ID)
                .clientId(oidcConfig.getClientId())
                .redirectUri(Constants.OIDC_REDIRECT_TEMPLATE)
                .clientSecret(oidcConfig.getClientSecret()).build();

        return new InMemoryClientRegistrationRepository(clientRegistration);
    }
    
    private CorsConfigurationSource getCorsConfigurationSource()
	{
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(corsAllowedOrigins));
		configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
    
     @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        LOG.debug("in filterChain() - securityType=" + config.getSecurityType());
        http.authorizeHttpRequests(authorizeRequests -> authorizeRequests.anyRequest().authenticated());

        if (Constants.OIDC_SECURITY_TYPE.equals(config.getSecurityType())) {
            LOG.debug("adding oidc login support");
            http.oauth2Login(withDefaults());
        } else if (Constants.BASIC_SECURITY_TYPE.equals(config.getSecurityType())) {
            LOG.debug("adding basic login support");
            http.httpBasic(withDefaults());
        }
        
        http.cors(c -> c.configurationSource(getCorsConfigurationSource())).csrf(c -> c.disable());

        if (sslEnabled) {
            http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
        }
        
        return http.build();
    }
    
    private SSLConfig getSslConfig() {
        SSLConfig retval = new SSLConfig();
        
        retval.setEnabled(sslEnabled);
        retval.setSslKeyAlias(sslKeyAlias);
        retval.setSslKeyPassword(sslKeyPassword);
        retval.setSslKeyStore(sslKeyStore);
        retval.setSslKeyStorePassword(sslKeyStorePassword);
        retval.setSslKeyStoreType(sslKeyStoreType);
        return retval;
    }
    
    
         
}
