package org.rbtdesign.qvu.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class ZipFolder {
    private static final Logger LOG = LoggerFactory.getLogger(ZipFolder.class);

    public static boolean doZip(File folder, File outputFile) {
        boolean retval = false;
        File p = outputFile.getParentFile();
        
        if (!p.exists()) {
            p.mkdirs();
        }
        
        try (FileOutputStream fos = new FileOutputStream(outputFile); ZipOutputStream zos = new ZipOutputStream(fos);) {
            List<String> paths = new ArrayList<>();
            getFilePaths(folder, paths);
            //now zip files one by one
            //create ZipOutputStream to write to the zip file

            for (String filePath : paths) {
                System.out.println("Zipping " + filePath);
                //for ZipEntry we need to keep only relative file path, so we used substring on absolute path
                ZipEntry ze = new ZipEntry(filePath.substring(folder.getAbsolutePath().length() + 1, filePath.length()));
                zos.putNextEntry(ze);
                //read the file and write to ZipOutputStream
                FileInputStream fis = new FileInputStream(filePath);
                byte[] buffer = new byte[1024];
                int len;
                while ((len = fis.read(buffer)) > 0) {
                    zos.write(buffer, 0, len);
                }
                zos.closeEntry();
                fis.close();
            }
            zos.close();
            fos.close();
            retval = true;
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
        
        return retval;
    }

    private static void getFilePaths(File folder, List<String> paths) {
        if (folder.exists() && folder.isDirectory()) {
            File[] files = folder.listFiles();
            
            if (files != null) {
                for (File f : files) {
                    if (f.isDirectory()) {
                        getFilePaths(f, paths);
                    } else if (f.isFile()) {
                        String nm = f.getName().toLowerCase();
                        if (isValidFile(nm)) {
                            paths.add(f.getAbsolutePath());
                        }
                    }
                }
            }
        }
    }
    
    private static boolean isValidFile(String fname) {
        return (fname.endsWith(".json") || fname.endsWith(".properties") || fname.endsWith(".pdf"));
    }   
}
