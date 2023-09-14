package org.rbtdesign.qvu.util;

import com.google.gson.Gson;
import com.nimbusds.jose.util.IOUtils;
import java.io.File;
import java.io.InputStream;
import static java.lang.System.in;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author rbtuc
 */
public class ConfigBuilder {
    public static <T> T build(String fname, Class<T> c) throws Exception {
        File f = new File(fname);
        
        if (f.exists() && f.isFile() && f.getName().toLowerCase().endsWith(".json")) {
            return new Gson().fromJson(FileUtils.readFileToString(new File(fname), "UTF-8"), c);
        } else {
            throw new Exception("invalid configuration file: " + fname);
        }
    }
    
    public static <T> T build(InputStream is, Class<T> c) throws Exception {
        return new Gson().fromJson(IOUtils.readInputStreamToString(is), c);
    }
}
