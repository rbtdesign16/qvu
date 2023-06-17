/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Properties;
import javax.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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

    @Value("#{environment.QVU_SECURITY_TYPE}")
    private String securityType;

    @Value("#{environment.QVU_SECURITY_CONFIG_FILE}")
    private String securityConfigFile;

    @PostConstruct
    private void init() {
        LOG.info("in SecurityConfig.init()");
        LOG.info("security type: " + securityType);
        LOG.info("security config file: " + securityConfigFile);
    }


    /*
    @DependsOn("basicrepo")
    private SecurityFilterChain getBasicAuthFilterChain(HttpSecurity http) throws Exception {
        http.httpBasic(withDefaults());
        return http.build();
    }

    @Bean
    @DependsOn("oidcrepo")
    public SecurityFilterChain getOidcFilterChain(HttpSecurity http) throws Exception {
        return http.build();
    }
     */
    @Bean("samlrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.SAML_SECURITY_TYPE)
    RelyingPartyRegistrationRepository samlRepository() throws Exception {
        LOG.debug("in samlRepository()");
        Properties p = Helper.loadProperties(securityConfigFile);
        RelyingPartyRegistration relyingPartyRegistration = null;
        if (StringUtils.isNotEmpty(p.getProperty(Constants.SAML_SIGNING_CERTIFICAT_FILE_PROPERTY))) {
            final Saml2X509Credential credentials = Saml2X509Credential.signing(getPrivateKey(p.getProperty(Constants.SAML_SIGNING_KEY_FILE_PROPERTY)),
                    getCertificate(p.getProperty(Constants.SAML_SIGNING_CERTIFICAT_FILE_PROPERTY)));

            relyingPartyRegistration = RelyingPartyRegistrations
                    .fromMetadataLocation(p.getProperty(Constants.SAML_IDP_URL_PROPERTY))
                    .registrationId("simple")
                    .signingX509Credentials((c) -> c.add(credentials))
                    .build();
        } else {
            relyingPartyRegistration
                    = RelyingPartyRegistrations
                            .fromMetadataLocation(p.getProperty(Constants.SAML_IDP_URL_PROPERTY))
                            .registrationId("simple")
                            .build();

        }
        return new InMemoryRelyingPartyRegistrationRepository(relyingPartyRegistration);

    }

    @Bean
    @DependsOn("samlrepo")
    @ConditionalOnProperty(name = Constants.SECURITY_TYPE_PROPERTY, havingValue = Constants.SAML_SECURITY_TYPE)
    public SecurityFilterChain samlFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated())
                .saml2Login(withDefaults());
        return http.build();
    }

    /*
    public SecurityFilterChain samlFilterChain(HttpSecurity http) throws Exception {
        LOG.debug("in samlFilterChain()");
        http.authorizeHttpRequests(authorize -> authorize.anyRequest()
                .authenticated())
                .saml2Login(withDefaults())
                .saml2Logout(withDefaults())
                .addFilterBefore(new Saml2MetadataFilter(samlRepository(),
                        new OpenSamlMetadataResolver()), Saml2WebSsoAuthenticationFilter.class);
        return http.build();
    }
     */
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
