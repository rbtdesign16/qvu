package org.rbt.qvu.controllers;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.ui.Model;

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

    @GetMapping("/")
    public String index(Model model, @AuthenticationPrincipal Saml2AuthenticatedPrincipal principal) {
        String emailAddress = principal.getFirstAttribute("email");
        model.addAttribute("emailAddress", emailAddress);
        model.addAttribute("userAttributes", principal.getAttributes());
        return "index";
    }

    @GetMapping("api/v1/db/info/{dsname}")
    public String getDatabaseInfo(@PathVariable String dsname) {
        LOG.debug("getDatabaseInfo called");
        return service.getDatabaseInfo(dsname);
    }

    @GetMapping("api/v1/db/all/info")
    public List<String> getAllDatabaseInfo() {
        LOG.debug("getDatabaseInfo called");
        return service.getAllDatabaseInfo();
    }

}
