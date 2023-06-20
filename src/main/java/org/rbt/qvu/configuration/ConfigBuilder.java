/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import com.google.gson.Gson;
import java.io.File;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author rbtuc
 */
public class ConfigBuilder {
    public static <T> T build(String fname, Class<T> c) throws Exception {
        File f = new File(fname);
        
        if (f.exists() && f.isFile() && f.getName().toLowerCase().endsWith(".json")) {
            Gson gson = new Gson();
            return gson.fromJson(FileUtils.readFileToString(new File(fname), "UTF-8"), c);
        } else {
            throw new Exception("invalid configuration file: " + fname);
        }
    }
}
