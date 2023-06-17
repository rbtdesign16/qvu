package org.rbt.qvu.controllers;

import java.util.ArrayList;
import java.util.List;
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
import org.springframework.security.saml2.provider.service.authentication.DefaultSaml2AuthenticatedPrincipal;

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
        retval.setName( auth.getName());
        for (GrantedAuthority ga : auth.getAuthorities()) {
            retval.getGrantedAuthorities().add(ga.getAuthority());
        }
         
        if (auth.getPrincipal() instanceof DefaultSaml2AuthenticatedPrincipal) {
            DefaultSaml2AuthenticatedPrincipal p = (DefaultSaml2AuthenticatedPrincipal)auth.getPrincipal();
            
            for (String att : p.getAttributes().keySet()) {
                List l2 = p.getAttribute(att);
                if (l2 != null) {
                    List<String> l = new ArrayList();
                    retval.getAttributes().put(att, l);
                    for (Object o : l2) {
                        l.add(o.toString());
                    }
                }
            }
        }
        
        return retval;
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
