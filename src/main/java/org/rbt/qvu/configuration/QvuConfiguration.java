/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
@EnableWebSecurity
// load properties from external repository location 
@PropertySource(ignoreResourceNotFound=true, value="file:${repository.folder}/config/application.properties")
public class QvuConfiguration {
    private static final Logger LOG = LoggerFactory.getLogger(QvuConfiguration.class);

    @Autowired
    private ConfigurationHelper config;

    @PostConstruct
    private void init() {
        LOG.info("in QvuConfiguration.init()");
    }
    
    @Value("${server.ssl.key-store:}")
    private String sslKeyStore;
            
    @Autowired
    private BasicAuthSecurityProvider basicAuthProvider;

    @Bean
    @ConditionalOnExpression("'${security.type}'.contains('basic')")
    AuthenticationManager basicAuthManager(HttpSecurity http) throws Exception {
        LOG.debug("in basicAuthManager()");
        AuthenticationManagerBuilder authenticationManagerBuilder
                = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(basicAuthProvider);
        return authenticationManagerBuilder.build();
    }

    @Bean
    @ConditionalOnExpression("'${security.type}'.contains('saml')")
    RelyingPartyRegistrationRepository samlRepository() throws Exception {
        LOG.debug("in samlRepository()");
        RelyingPartyRegistration relyingPartyRegistration = null;
        SamlConfiguration samlConfig = config.getSecurityConfig().getSamlConfiguration();
        if (samlConfig != null) {
            if (samlConfig.isSignAssertions()) {
                String keyFileName = samlConfig.getSigningKeyFileName();
                final Saml2X509Credential credentials
                        = Saml2X509Credential.signing(getPrivateKey(keyFileName),
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
        } else {
            return null;
        }

    }

    @Bean
    @ConditionalOnExpression("'${security.type}'.contains('oidc')")
    ClientRegistrationRepository oidcRepository() throws Exception {
        LOG.debug("in oidcRepository()");
        OidcConfiguration oidcConfig = config.getSecurityConfig().getOidcConfiguration();
        ClientRegistration clientRegistration = ClientRegistrations
                .fromOidcIssuerLocation(oidcConfig.getIssuerLocationUrl())
                .clientId(oidcConfig.getClientId())
                .clientSecret(oidcConfig.getClientSecret()).build();

        return new InMemoryClientRegistrationRepository(clientRegistration);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        LOG.debug("in filterChain() - securityType=" + config.getSecurityType());
        
        // if no ssl key store then allow http
        if (StringUtils.isEmpty(sslKeyStore)) {
            http
                .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated())
                .csrf(csrf -> csrf.disable());
        } else { // force https
            http
                .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated())
                .requiresChannel(channel -> 
                    channel.anyRequest().requiresSecure())
                .csrf(csrf -> csrf.disable());
        }
        
        if (config.getSecurityType().contains(Constants.OIDC_SECURITY_TYPE)) {
            LOG.debug("adding oauth2 login support");
            http.oauth2Login(withDefaults());
        }

        if (config.getSecurityType().contains(Constants.SAML_SECURITY_TYPE)) {
            LOG.debug("adding saml login support");
            http.saml2Login(withDefaults());
        }

        if (config.getSecurityType().contains(Constants.BASIC_SECURITY_TYPE)) {
            LOG.debug("adding basic auth login suppor");
            http.httpBasic(withDefaults());
        }

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
