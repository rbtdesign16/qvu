/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;
import javax.annotation.PostConstruct;
import org.rbt.qvu.util.Constants;
import org.rbt.qvu.util.Messages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.saml2.provider.service.metadata.OpenSamlMetadataResolver;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.web.DefaultRelyingPartyRegistrationResolver;
import org.springframework.security.saml2.provider.service.web.Saml2MetadataFilter;
import org.springframework.security.saml2.provider.service.web.authentication.Saml2WebSsoAuthenticationFilter;

@Configuration
@EnableWebSecurity
@PropertySource("classpath:application.properties")

public class SecurityConfig {
    private static Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${security.config}")
    private String securityConfigFile;

    @Autowired
    private RelyingPartyRegistrationRepository relyingPartyRegistrationRepository;

    private String securityType;

    @PostConstruct
    private void init() {
        LOG.info("in SecurityConfig.init()");
        try (InputStream is = new FileInputStream(securityConfigFile)) {
            Properties p = new Properties();
            p.load(is);

            securityType = p.getProperty("security.type");

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        switch (securityType) {
            case Constants.BASIC_SECURITY_TYPE:
                return getBasicAuthFilterChain(http);
            case Constants.OIDC_SECURITY_TYPE:
                return getOidcFilterChain(http);
            case Constants.SAML_SECURITY_TYPE:
                return getSamlFilterChain(http);
            default:
                throw new Exception(Messages.INVALID_SECURITY_CONFIGURATION);

        }
    }

    private SecurityFilterChain getBasicAuthFilterChain(HttpSecurity http) throws Exception {
        http.httpBasic(withDefaults());
        return http.build();
    }

    public SecurityFilterChain getOidcFilterChain(HttpSecurity http) throws Exception {
        DefaultRelyingPartyRegistrationResolver relyingPartyRegistrationResolver = new DefaultRelyingPartyRegistrationResolver(this.relyingPartyRegistrationRepository);
        Saml2MetadataFilter filter = new Saml2MetadataFilter(relyingPartyRegistrationResolver, new OpenSamlMetadataResolver());

        http.authorizeHttpRequests(authorize -> authorize.anyRequest()
                .authenticated())
                .saml2Login(withDefaults())
                .saml2Logout(withDefaults())
                .addFilterBefore(filter, Saml2WebSsoAuthenticationFilter.class);
        return http.build();
    }

    private SecurityFilterChain getSamlFilterChain(HttpSecurity http) throws Exception {
        DefaultRelyingPartyRegistrationResolver relyingPartyRegistrationResolver = new DefaultRelyingPartyRegistrationResolver(this.relyingPartyRegistrationRepository);
        Saml2MetadataFilter filter = new Saml2MetadataFilter(relyingPartyRegistrationResolver, new OpenSamlMetadataResolver());

        http.authorizeHttpRequests(authorize -> authorize.anyRequest()
                .authenticated())
                .saml2Login(withDefaults())
                .saml2Logout(withDefaults())
                .addFilterBefore(filter, Saml2WebSsoAuthenticationFilter.class);
        return http.build();
    }

}
