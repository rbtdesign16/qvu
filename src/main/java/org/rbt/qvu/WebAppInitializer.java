package org.rbt.qvu;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.servlet.DispatcherServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletRegistration;
import javax.annotation.PostConstruct;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

public class WebAppInitializer implements WebApplicationInitializer {
    private static Logger LOG = LoggerFactory.getLogger(WebAppInitializer.class);
    @PostConstruct
    private void init() {
        LOG.info("in WebAppInitializer.init()");
    }
    
    @Override
    public void onStartup(ServletContext container) {
        // Create the 'root' Spring application context
        AnnotationConfigWebApplicationContext rootContext
                = new AnnotationConfigWebApplicationContext();
        rootContext.setConfigLocation("org.rbt.qvu");

        // Manage the lifecycle of the root application context
        container.addListener(new ContextLoaderListener(rootContext));
        // Register and map the dispatcher servlet
        ServletRegistration.Dynamic dispatcher
                = container.addServlet("dispatcher", new DispatcherServlet(rootContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
