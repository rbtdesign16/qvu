/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.security;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;
import org.rbt.qvu.SecurityConfig;
import org.rbt.qvu.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 *
 * @author rbtuc
 */
public class OidcCondition implements Condition {
    private static Logger LOG = LoggerFactory.getLogger(OidcCondition.class);

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return Constants.OIDC_SECURITY_TYPE.equals(System.getProperty("QVU_SECURITY_TYPE"));
    }
}
