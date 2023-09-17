package org.rbtdesign.qvu.configuration.database;

import java.util.ArrayList;
import java.util.List;
import org.rbtdesign.qvu.dto.ForeignKey;
import org.rbtdesign.qvu.dto.TableSettings;
import org.rbtdesign.qvu.util.Constants;

/**
 *
 * @author rbtuc
 */
public class DataSourceConfiguration {
    private String databaseType;
    private String datasourceName;
    private String description;
    private String url;
    private String driver;
    private String schema;
    private String username;
    private String password;
    private Long connectionTimeout;
    private Long idleTimeout;
    private Long maxLifeTime;
    private Integer maxPoolSize;
    private boolean newDatasource;
    boolean enabled = true;
    private Integer maxImportedKeyDepth = Constants.DEFAULT_MAX_IMPORTED_KEY_DEPTH;
    private Integer maxExportedKeyDepth = Constants.DEFAULT_MAX_EXPORTED_KEY_DEPTH;

    private List<String> roles = new ArrayList<>();
    private List<TableSettings> datasourceTableSettings = new ArrayList<>();
    private List<ForeignKey> customForeignKeys = new ArrayList<>();


    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(String databaseType) {
        this.databaseType = databaseType;
    }

    public String getDatasourceName() {
        return datasourceName;
    }

    public void setDatasourceName(String datasourceName) {
        this.datasourceName = datasourceName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDriver() {
        return driver;
    }

    public void setDriver(String driver) {
        this.driver = driver;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getConnectionTimeout() {
        return connectionTimeout;
    }

    public void setConnectionTimeout(Long connectionTimeout) {
        this.connectionTimeout = connectionTimeout;
    }

    public Long getIdleTimeout() {
        return idleTimeout;
    }

    public void setIdleTimeout(Long idleTimeout) {
        this.idleTimeout = idleTimeout;
    }

    public Long getMaxLifeTime() {
        return maxLifeTime;
    }

    public void setMaxLifeTime(Long maxLifeTime) {
        this.maxLifeTime = maxLifeTime;
    }

    public Integer getMaxPoolSize() {
        return maxPoolSize;
    }

    public void setMaxPoolSize(Integer maxPoolSize) {
        this.maxPoolSize = maxPoolSize;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isNewDatasource() {
        return newDatasource;
    }

    public void setNewDatasource(boolean newDatasource) {
        this.newDatasource = newDatasource;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public List<TableSettings> getDatasourceTableSettings() {
        return datasourceTableSettings;
    }

    public void setDatasourceTableSettings(List<TableSettings> datasourceTableSettings) {
        this.datasourceTableSettings = datasourceTableSettings;
    }

    public List<ForeignKey> getCustomForeignKeys() {
        return customForeignKeys;
    }

    public void setCustomForeignKeys(List<ForeignKey> customForeignKeys) {
        this.customForeignKeys = customForeignKeys;
    }

    public Integer getMaxImportedKeyDepth() {
        return maxImportedKeyDepth;
    }

    public void setMaxImportedKeyDepth(Integer maxImportedKeyDepth) {
        this.maxImportedKeyDepth = maxImportedKeyDepth;
    }

    public Integer getMaxExportedKeyDepth() {
        return maxExportedKeyDepth;
    }

    public void setMaxExportedKeyDepth(Integer maxExportedKeyDepth) {
        this.maxExportedKeyDepth = maxExportedKeyDepth;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

}
