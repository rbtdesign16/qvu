/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu;

import org.rbt.qvu.configuration.Config;
import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.security.BasicAuthSecurityProvider;
import org.rbt.qvu.configuration.security.OidcConfiguration;
import org.rbt.qvu.configuration.security.SamlConfiguration;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.authentication.AuthenticationManager;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private Config config;

    @PostConstruct
    private void init() {
        LOG.info("in SecurityConfig.init()");
        LOG.info("security type: " + config.getAppConfig().getSecurityType());
        LOG.info("security config file: " + config.getAppConfig().getSecurityConfigurationFile());
    }

    @Autowired
    private BasicAuthSecurityProvider basicAuthProvider;

    @Bean("basicmgr")
    @DependsOn("config")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.BASIC_SECURITY_TYPE)
    AuthenticationManager basicAuthManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder
                = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(basicAuthProvider);
        return authenticationManagerBuilder.build();
    }

    @Bean("samlrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.SAML_SECURITY_TYPE)
    RelyingPartyRegistrationRepository samlRepository() throws Exception {
        LOG.debug("in samlRepository()");
        RelyingPartyRegistration relyingPartyRegistration = null;
        SamlConfiguration samlConfig = config.getSecurityConfig().getSamlConfiguration();
        if (samlConfig.isSignAssertions()) {
            final Saml2X509Credential credentials
                    = Saml2X509Credential.signing(getPrivateKey(samlConfig.getSigningKeyFileName()),
                            getCertificate(samlConfig.getSigningCertFileName()));

            relyingPartyRegistration = RelyingPartyRegistrations
                    .fromMetadataLocation(samlConfig.getIdpUrl())
                    .registrationId("qvusaml")
                    .signingX509Credentials((c) -> c.add(credentials))
                    .build();
        } else {
            relyingPartyRegistration
                    = RelyingPartyRegistrations
                            .fromMetadataLocation(samlConfig.getIdpUrl())
                            .registrationId("qvusaml")
                            .build();

        }

        return new InMemoryRelyingPartyRegistrationRepository(relyingPartyRegistration);

    }

    @Bean("oauthrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.OIDC_SECURITY_TYPE)
    ClientRegistrationRepository oauthRepository() throws Exception {
        LOG.debug("in oauthRepository()");
        OidcConfiguration oidcConfig = config.getSecurityConfig().getOidcConfiguration();
        ClientRegistration clientRegistration = ClientRegistrations
                .fromOidcIssuerLocation(oidcConfig.getIssuerLocationUrl())
                .clientId(oidcConfig.getClientId())
                .clientSecret(oidcConfig.getClientSecret()).build();

        return new InMemoryClientRegistrationRepository(clientRegistration);

    }

    @Bean
    @DependsOn("basicmgr")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.BASIC_SECURITY_TYPE)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .authenticationManager(basicAuthManager(http))
                .csrf(csrf -> csrf.disable())
                .httpBasic(withDefaults());
        return http.build();
    }

    @Bean
    @DependsOn("samlrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.SAML_SECURITY_TYPE)
    public SecurityFilterChain samlFilterChain(HttpSecurity http) throws Exception {
        LOG.debug("in samlFilterChain() - ");
        http
                .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated())
                .csrf(csrf -> csrf.disable())
                .saml2Login(withDefaults());
        return http.build();
    }

    private GrantedAuthoritiesMapper userAuthoritiesMapper() {
        return (authorities) -> {
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

            authorities.forEach(authority -> {
                 if (OidcUserAuthority.class.isInstance(authority)) {
                    OidcUserAuthority oidcUserAuthority = (OidcUserAuthority)authority;

                    OidcUserInfo userInfo = oidcUserAuthority.getUserInfo();
                    
                    String roleName = userInfo.getClaimAsString("role");
                    if (StringUtils.isNotEmpty(roleName)){
                         mappedAuthorities.add(new SimpleGrantedAuthority(roleName));
                    }
                } else if (OAuth2UserAuthority.class.isInstance(authority)) {
                    OAuth2UserAuthority oauth2UserAuthority = (OAuth2UserAuthority)authority;
                    Map<String, Object> userAttributes = oauth2UserAuthority.getAttributes();
                    
                    for (String s : userAttributes.keySet()) {
                        LOG.error("------->1=" + s);
                    }
                    if (userAttributes.containsKey("role")){
                        String roleName = (String)userAttributes.get("role");
                        mappedAuthorities.add(new SimpleGrantedAuthority(roleName));
                    }
                } else {
                    LOG.error("----------->2=" + authority.getClass().getName());
                }
            });

            return mappedAuthorities;
        };
    }
    
    @Bean
    @DependsOn("oauthrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.OIDC_SECURITY_TYPE)
    public SecurityFilterChain oauthFilterChain(HttpSecurity http) throws Exception {
        LOG.debug("in oauthFilterChain()");
        http
                .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated())
                .csrf(csrf -> csrf.disable())
                .oauth2Login(oauth2 -> oauth2.userInfoEndpoint(userInfo -> userInfo.userAuthoritiesMapper(this.userAuthoritiesMapper())));
        return http.build();
    }

    private PrivateKey getPrivateKey(String keyFile) throws Exception {
        byte[] key = Files.readAllBytes(Paths.get(keyFile));
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(key);
        return keyFactory.generatePrivate(keySpec);
    }

    private X509Certificate getCertificate(String certFile) throws Exception {
        X509Certificate retval = null;
        CertificateFactory fac = CertificateFactory.getInstance("X509");
        try (InputStream is = FileUtils.openInputStream(new File(certFile))) {
            retval = (X509Certificate) fac.generateCertificate(is);
        }

        return retval;
    }

}
