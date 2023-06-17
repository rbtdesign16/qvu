/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu;

import java.io.FileInputStream;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Properties;
import javax.annotation.PostConstruct;
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
    RelyingPartyRegistrationRepository samlRepository() {
        LOG.debug("in samlRepository()");
        Properties p = Helper.loadProperties(securityConfigFile);

        RelyingPartyRegistration relyingPartyRegistration
                = RelyingPartyRegistrations
                        .fromMetadataLocation(p.getProperty(Constants.SAML_IDP_URL_PROPERTY))
                        .registrationId("qvu")
                        .entityId("http://localhost:8080/realms/qvu-realm") 
                        .assertionConsumerServiceLocation("/saml") 
                        .build();
        return new InMemoryRelyingPartyRegistrationRepository(relyingPartyRegistration);

        /*
        X509Certificate certificate = X509Support.decodeCertificate(new File(p.getProperty));
        Saml2X509Credential credential = Saml2X509Credential.verification(certificate);

        RelyingPartyRegistration wac = RelyingPartyRegistrations
                .fromMetadataLocation(p.getProperty(Constants.SAML_IDP_URL_PROPERTY))
                .registrationId("qvu");
                .assertingPartyDetails((details) -> details.verificationX509Credentials((c) -> 
                    c.add(credential))
                        .wantAuthnRequestsSigned(Boolean.parseBoolean(p.getProperty(Constants.WANT_SAML_ASSERTIONS_SIGNED_PROPERTY, "false"))));
        
        return new InMemoryRelyingPartyRegistrationRepository(wac);
         */
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

    private X509Certificate getX509Certificate(String fileName) {
        X509Certificate retval = null;
        try (FileInputStream is = new FileInputStream(fileName)) {
            final CertificateFactory factory = CertificateFactory.getInstance("X.509");
            retval = (X509Certificate) factory.generateCertificate(is);
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

}
