/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.security.BasicAuthSecurityProvider;
import org.rbt.qvu.configuration.security.OidcConfiguration;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;

@Configuration
@EnableWebSecurity
@PropertySources({
    @PropertySource(value = "classpath:default-application.properties"),
    @PropertySource(value = "file:${repository.folder}/config/application.properties", ignoreResourceNotFound = true)
})
public class QvuConfiguration {
    private static final Logger LOG = LoggerFactory.getLogger(QvuConfiguration.class);

    @Autowired
    private ConfigurationHelper config;

    @Value("${server.ssl.key-store:}")
    private String sslKeyStore;

    @Value("${server.port}")
    private Integer serverPort;

    @Value("${server.servlet.context-path}")
    private String servletContextPath;

    @Value("${security.type}")
    private String securityType;

    @PostConstruct
    private void init() {
        LOG.info("in QvuConfiguration.init()");
        LOG.info("server.port=" + serverPort);
        LOG.info("server.servlet.context-path=" + servletContextPath);
        LOG.info("security.type=" + securityType);
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
        
        OidcConfiguration oidcConfig = config.getSecurityConfig().getOidcConfiguration();
        ClientRegistration clientRegistration = ClientRegistrations
                .fromOidcIssuerLocation(oidcConfig.getIssuerLocationUrl())
                .scope(scopes)
                .registrationId("qvuoidc")
                .clientId(oidcConfig.getClientId())
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .clientSecret(oidcConfig.getClientSecret()).build();

        return new InMemoryClientRegistrationRepository(clientRegistration);
    }

    public GrantedAuthoritiesMapper userAuthoritiesMapper() {
               System.out.println("------->a");
        return (authorities) -> {
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

                System.out.println("------->0");
            authorities.forEach(authority -> {
                System.out.println("------->1");
                if (OidcUserAuthority.class.isInstance(authority)) {
                    OidcUserAuthority oidcUserAuthority = (OidcUserAuthority) authority;

                    OidcIdToken idToken = oidcUserAuthority.getIdToken();
                    OidcUserInfo userInfo = oidcUserAuthority.getUserInfo();

                    // Map the claims found in idToken and/or userInfo
                    // to one or more GrantedAuthority's and add it to mappedAuthorities
                } else if (OAuth2UserAuthority.class.isInstance(authority)) {
                    OAuth2UserAuthority oauth2UserAuthority = (OAuth2UserAuthority) authority;

                    Map<String, Object> userAttributes = oauth2UserAuthority.getAttributes();

                    // Map the attributes found in userAttributes
                    // to one or more GrantedAuthority's and add it to mappedAuthorities
                }
            });

            return mappedAuthorities;
        };
    }

    private void oidcFilterChainConfig(HttpSecurity http) throws Exception {
        LOG.debug("adding oidc login support");
         http.authorizeHttpRequests(authorizeRequests -> authorizeRequests.anyRequest()
            .authenticated())
            .oauth2Login(oauth2 -> oauth2
			    .userInfoEndpoint(userInfo -> userInfo.userAuthoritiesMapper(userAuthoritiesMapper())));
    }

    private void basicFilterChainConfig(HttpSecurity http) throws Exception {
        LOG.debug("adding basiv login support");

        http.httpBasic(withDefaults());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        LOG.debug("in filterChain() - securityType=" + config.getSecurityType());
        if (Constants.OIDC_SECURITY_TYPE.equals(config.getSecurityType())) {
            oidcFilterChainConfig(http);
        } else if (Constants.BASIC_SECURITY_TYPE.equals(config.getSecurityType())) {
            basicFilterChainConfig(http);
        }

        if (StringUtils.isNotEmpty(sslKeyStore)) {
            http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
        }
        return http.build();
    }

}
