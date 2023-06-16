/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.security;

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
public class SamlCondition implements Condition {
    private static Logger LOG = LoggerFactory.getLogger(SamlCondition.class);

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        LOG.info("env=" + System.getProperty("QVU_SECURITY_TYPE"));
        boolean retval = Constants.SAML_SECURITY_TYPE.equals(System.getProperty("QVU_SECURITY_TYPE"));
        LOG.info("retval=" + retval);
        return retval;
    }
}
