/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.io.FileInputStream;
import java.util.Properties;
import org.rbt.qvu.SecurityConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class Helper {

    private static Logger LOG = LoggerFactory.getLogger(Helper.class);
   public static Properties loadProperties(String fileName) {
       Properties retval = new Properties();
       try (FileInputStream is = new FileInputStream(fileName)) {
           retval.load(is);
           
       } catch (Exception ex) {
           LOG.error(ex.toString(), ex);
       }
       
       return retval;
   } 
}
