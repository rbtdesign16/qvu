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
import org.rbt.qvu.security.SamlCondition;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.PropertySource;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.saml2.provider.service.metadata.OpenSamlMetadataResolver;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;
import org.springframework.security.saml2.provider.service.web.Saml2MetadataFilter;
import org.springframework.security.saml2.provider.service.web.authentication.Saml2WebSsoAuthenticationFilter;

@Configuration
@EnableWebSecurity
@PropertySource("classpath:application.properties")
public class SecurityConfig {

    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${security.type}")
    private String securityType;

    @Value("${security.config}")
    private String securityConfigFile;

    @PostConstruct
    private void init() {
        LOG.info("security type: " + securityType);
        LOG.info("security config file: " + securityConfigFile);
    }

    @Bean("samlrepo")
    @Conditional(SamlCondition.class)
    RelyingPartyRegistrationRepository samlRepo() throws Exception {
        Properties p = Helper.loadProperties(securityConfigFile);
        RelyingPartyRegistration relyingPartyRegistration
                = RelyingPartyRegistrations.fromMetadataLocation(p.getProperty(Constants.SAML_IDP_URL_PROPERTY))
                         .registrationId("simple").build();
        return new InMemoryRelyingPartyRegistrationRepository(relyingPartyRegistration);
    }

    /*
    @Bean
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
    @Bean
    @DependsOn("samlrepo")
    @Conditional(SamlCondition.class)
    public SecurityFilterChain samlFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> authorize.anyRequest()
                .authenticated())
                .saml2Login(withDefaults())
                .saml2Logout(withDefaults())
                .addFilterBefore(new Saml2MetadataFilter(samlRepo(), new OpenSamlMetadataResolver()), Saml2WebSsoAuthenticationFilter.class);

        return http.build();
    }

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
