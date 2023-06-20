/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import com.google.gson.Gson;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.StringTokenizer;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
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
    
    public static <T> T jsonToObject(File f, Class<T> c) throws IOException {
        Gson gson = new Gson();
        return gson.fromJson(FileUtils.readFileToString(f, "UTF-8"), c);
    }
}
