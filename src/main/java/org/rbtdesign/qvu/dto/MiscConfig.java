package org.rbtdesign.qvu.dto;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class MiscConfig {
    private String backupFolder;
    private int serverPort;
    private String corsAllowedOrigins;
    private String defaultPageUnits = Constants.DEFAULT_PAGE_UNITS;
    private String defaultPageOrientation = Constants.PAGE_ORIENTATION_PORTRAIT;
    private String defaultPageSize = Constants.PAGE_SIZE_NAMES[0];
    private boolean modified;
    private boolean enabled;
    private List<String> pageSizes = new ArrayList<>();
    private List<String> pageOrientations = new ArrayList<>();
    private List<String> pageUnits = new ArrayList<>();

    public String getBackupFolder() {
        return backupFolder;
    }

    public void setBackupFolder(String backupFolder) {
        this.backupFolder = backupFolder;
    }

    public int getServerPort() {
        return serverPort;
    }

    public void setServerPort(int serverPort) {
        this.serverPort = serverPort;
    }

    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }

    public void setCorsAllowedOrigins(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    public boolean isModified() {
        return modified;
    }

    public void setModified(boolean modified) {
        this.modified = modified;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getDefaultPageUnits() {
        return defaultPageUnits;
    }

    public void setDefaultPageUnits(String defaultPageUnits) {
        this.defaultPageUnits = defaultPageUnits;
    }

    public String getDefaultPageOrientation() {
        return defaultPageOrientation;
    }

    public void setDefaultPageOrientation(String defaultPageOrientation) {
        this.defaultPageOrientation = defaultPageOrientation;
    }

    public String getDefaultPageSize() {
        return defaultPageSize;
    }

    public void setDefaultPageSize(String defaultPageSize) {
        this.defaultPageSize = defaultPageSize;
    }

    public List<String> getPageSizes() {
        return pageSizes;
    }

    public void setPageSizes(List<String> pageSizes) {
        this.pageSizes = pageSizes;
    }

    public List<String> getPageUnits() {
        return pageUnits;
    }

    public void setPageUnits(List<String> pageUnits) {
        this.pageUnits = pageUnits;
    }

    public List<String> getPageOrientations() {
        return pageOrientations;
    }

    public void setPageOrientations(List<String> pageOrientations) {
        this.pageOrientations = pageOrientations;
    }

    
}
