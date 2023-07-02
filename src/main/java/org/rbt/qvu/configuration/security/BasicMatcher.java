/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration.security;

import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.util.Constants;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 *
 * @author rbtuc
 */
public class BasicMatcher implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String securityType = System.getProperty(Constants.SECURITY_TYPE_PROPERTY);
        
        return Constants.BASIC_SECURITY_TYPE.equals(securityType) || StringUtils.isEmpty(securityType);
    }
}

