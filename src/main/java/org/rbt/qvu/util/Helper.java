/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import jakarta.xml.bind.DatatypeConverter;
import java.io.FileInputStream;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.StringTokenizer;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.OperationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class Helper {
    public static final SimpleDateFormat TS = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
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

    public static List<String> commaDelimitedToList(String input) {
        List<String> retval = new ArrayList<>();

        if (StringUtils.isNotEmpty(input)) {
            StringTokenizer st = new StringTokenizer(input, ",");
            while (st.hasMoreTokens()) {
                retval.add(st.nextToken());
            }
        }

        return retval;
    }
    
    public static String toMd5Hash(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        md.update(input.getBytes("UTF-8"));
        return  DatatypeConverter.printHexBinary(md.digest(input.getBytes())).toUpperCase();
    }
    
    public static void populateResultError(OperationResult res, Throwable t) {
        res.setErrorCode(OperationResult.UNEXPECTED_EXCEPTION);
        res.setMessage(t.toString());
    }
    
}
