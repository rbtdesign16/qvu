package org.rbt.qvu.controllers;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;

import org.rbt.qvu.services.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.rbt.qvu.dto.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;

/**
 * The type Main controller.
 */
@RestController
@CrossOrigin(origins = "*")
public class MainController {

    private static Logger LOG = LogManager.getLogger(MainController.class);

    @Autowired
    MainService service;

    @PostConstruct
    private void init() {
        LOG.info("in MainController.init()");
    }

    @GetMapping("api/v1/auth/info")
    public AuthenticatedUser getAuthenticatedInfo() {
        AuthenticatedUser retval = new AuthenticatedUser();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        retval.setName(auth.getName());
        for (GrantedAuthority ga : auth.getAuthorities()) {
            retval.getGrantedAuthorities().add(ga.getAuthority());
        }

        if (auth.getPrincipal() instanceof Saml2AuthenticatedPrincipal) {
            loadUserAttributes(retval, ((Saml2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
        } else if (auth.getPrincipal() instanceof OAuth2AuthenticatedPrincipal) {
            loadUserAttributes(retval, ((OAuth2AuthenticatedPrincipal) auth.getPrincipal()).getAttributes());
        } else {
            
        }

        return retval;
    }

    private void loadUserAttributes(AuthenticatedUser user, Map attributes) {
        for (Object att : attributes.keySet()) {
            Object val = attributes.get(att);
            if (val != null) {
                List<String> l = new ArrayList();
                user.getAttributes().put(att.toString(), l);

                if (val instanceof Collection) {
                    for (Object o : (Collection) val) {
                        l.add(o.toString());
                    }
                } else {
                    l.add(val.toString());
                }
            }
        }
    }

    @GetMapping("api/v1/db/info/{dsname}")
    public String getDatabaseInfo(@PathVariable String dsname) {
        return service.getDatabaseInfo(dsname);
    }

    @GetMapping("api/v1/db/all/info")
    public List<String> getAllDatabaseInfo() {
        return service.getAllDatabaseInfo();
    }
}
