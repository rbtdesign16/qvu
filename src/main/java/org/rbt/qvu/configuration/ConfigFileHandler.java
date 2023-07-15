/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.configuration;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.SaveException;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.util.Errors;
import org.rbt.qvu.util.Helper;
import org.rbt.qvu.util.UserComparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
public class ConfigFileHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ConfigFileHandler.class);

    @Autowired
    private Config config;

    private final Gson gson = new Gson();
    private final Gson prettyJson = new GsonBuilder().setPrettyPrinting().disableHtmlEscaping().create();

    public Gson getGson() {
        return getGson(false);
    }

    public Gson getGson(boolean pretty) {
        if (pretty) {
            return prettyJson;
        } else {
            return gson;
        }
    }

    public List<DataSourceConfiguration> loadDatasources() {
        List<DataSourceConfiguration> retval = config.getDatasourcesConfig().getDatasources();
        if (LOG.isDebugEnabled()) {
            LOG.debug("Datasources: " + gson.toJson(retval, ArrayList.class));
        }
        return retval;
    }

    public OperationResult saveDatasource(DataSourceConfiguration datasource) {
        OperationResult retval = new OperationResult();
        DataSourcesConfiguration datasources = null;
        try {
            File f = new File(config.getDatasourceConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                datasources = gson.fromJson(new String(bytes), DataSourcesConfiguration.class);

                if (datasources != null) {
                    if (datasources.getLastUpdated() > config.getDatasourcesConfig().getLastUpdated()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage( Errors.getMessage(retval.getErrorCode(), new String[] {"datrasources"}));
                        throw new SaveException(retval);
                    } else {
                        int indx = -1;
                        for (int i = 0; i < datasources.getDatasources().size(); ++i) {
                            DataSourceConfiguration ds = datasources.getDatasources().get(i);
                            if (ds.getDatasourceName().equalsIgnoreCase(datasource.getDatasourceName())) {
                                indx = i;
                                break;
                            }
                        }

                        if (indx > -1) {
                            if (datasource.isNewDatasource()) {
                                retval.setErrorCode(OperationResult.RECORD_EXISTS);
                                retval.setMessage( Errors.getMessage(retval.getErrorCode(), new String[] { datasource.getDatasourceName()}));
                                throw new SaveException(retval);
                            } else {
                                datasources.getDatasources().set(indx, datasource);
                            }
                        } else {
                            datasources.getDatasources().add(datasource);
                        }
                    }
                }
            }

            if (datasources != null) {
                datasources.setLastUpdated(System.currentTimeMillis());
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(datasources).getBytes());
                }
                config.setDatasourcesConfig(datasources);
                retval.setResult(config.getDatasourcesConfig().getDatasources());
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteDatasource(String datasourceName) {
        OperationResult retval = new OperationResult();
        DataSourcesConfiguration datasources = null;
        try {
            File f = new File(config.getDatasourceConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                datasources = gson.fromJson(new String(bytes), DataSourcesConfiguration.class);

                if (datasources != null) {
                    Iterator<DataSourceConfiguration> it = datasources.getDatasources().iterator();
                    while (it.hasNext()) {
                        DataSourceConfiguration ds = it.next();
                        if (ds.getDatasourceName().equalsIgnoreCase(datasourceName)) {
                            it.remove();
                            break;
                        }
                    }
                }
            }

            if (datasources != null) {
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(datasources).getBytes());
                    config.setDatasourcesConfig(datasources);
                    retval.setErrorCode(OperationResult.SUCCESS);
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;

    }

    public OperationResult saveRole(Role role) {
        OperationResult retval = new OperationResult();
        SecurityConfiguration securityConfig = null;
        try {
            File f = new File(config.getSecurityConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                securityConfig = gson.fromJson(new String(bytes), SecurityConfiguration.class);

                if (securityConfig != null) {
                    int indx = -1;
                    List<Role> roles = securityConfig.getBasicConfiguration().getRoles();
                    for (int i = 0; i < roles.size(); ++i) {
                        Role r = roles.get(i);
                        if (r.getName().equalsIgnoreCase(role.getName())) {
                            indx = i;
                            break;
                        }
                    }

                    if (indx > -1) {
                        if (role.isNewRecord()) {
                            retval.setErrorCode(OperationResult.RECORD_EXISTS);
                            retval.setMessage("role " + role.getName() + " already exists");
                            throw new SaveException(retval);
                        } else {
                            roles.set(indx, role);
                        }
                    } else {
                        roles.add(role);
                    }

                    Collections.sort(roles, new Comparator<Role>() {
                        @Override
                        public int compare(Role o1, Role o2) {
                            return o1.getName().compareTo(o2.getName());

                        }

                    });
                }
            }

            if (securityConfig != null) {
                saveSecurityConfig(securityConfig);
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteRole(String roleName) {
        OperationResult retval = new OperationResult();
        SecurityConfiguration securityConfig = null;
        try {
            File f = new File(config.getSecurityConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                securityConfig = gson.fromJson(new String(bytes), SecurityConfiguration.class);

                if (securityConfig != null) {
                    Iterator<Role> it = securityConfig.getBasicConfiguration().getRoles().iterator();
                    while (it.hasNext()) {
                        Role r = it.next();
                        if (r.getName().equalsIgnoreCase(roleName)) {
                            it.remove();
                            break;
                        }
                    }
                }
            }

            if (securityConfig != null) {
                saveSecurityConfig(securityConfig);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;

    }

    public OperationResult saveUser(User user) {
        OperationResult retval = new OperationResult();
        SecurityConfiguration securityConfig = null;
        try {
            File f = new File(config.getSecurityConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                securityConfig = gson.fromJson(new String(bytes), SecurityConfiguration.class);

                if (securityConfig != null) {
                    User curuser = securityConfig.getBasicConfiguration().findUser(user.getUserId());
                    if (curuser != null) {
                        if (user.isNewRecord()) {
                            retval.setErrorCode(OperationResult.RECORD_EXISTS);
                            retval.setMessage("user " + user.getUserId() + " already exists");
                            throw new SaveException(retval);
                        } else {
                            //  need to add password back since we do not send to client
                            user.setPassword(curuser.getPassword());
                            BeanUtils.copyProperties(user, curuser, "password");
                        }
                    } else {
                        user.setPassword(Helper.toMd5Hash(user.getPassword()));
                        securityConfig.getBasicConfiguration().getUsers().add(user);
                    }

                    Collections.sort(securityConfig.getBasicConfiguration().getUsers(), new UserComparator());
                }
            }

            if (securityConfig != null) {
                this.saveSecurityConfig(securityConfig);
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteUser(String userId) {
        OperationResult retval = new OperationResult();
        SecurityConfiguration securityConfig = null;
        try {
            File f = new File(config.getSecurityConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                securityConfig = gson.fromJson(new String(bytes), SecurityConfiguration.class);

                if (securityConfig != null) {
                    Iterator<User> it = securityConfig.getBasicConfiguration().getUsers().iterator();
                    while (it.hasNext()) {
                        User u = it.next();
                        if (u.getUserId().equalsIgnoreCase(userId)) {
                            it.remove();
                            break;
                        }
                    }
                }
            }

            if (securityConfig != null) {
                saveSecurityConfig(securityConfig);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult saveSecurityConfig(SecurityConfiguration securityConfig) throws Exception {
        OperationResult retval = new OperationResult();

        SecurityConfiguration cursec = null;
        File f = new File(config.getSecurityConfigurationFileName());
        try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
            byte[] bytes = fis.readAllBytes();
            cursec = gson.fromJson(new String(bytes), SecurityConfiguration.class);

            if (cursec.getLastUpdated() > securityConfig.getLastUpdated()) {
                retval.setErrorCode(Errors.RECORD_UPDATED);
                retval.setMessage( Errors.getMessage(retval.getErrorCode(), new String[] {"security configuration"}));
                throw new SaveException(retval);
            }
        }

        securityConfig.setLastUpdated(System.currentTimeMillis());
        
        // make sure all records are marked as not new
        if (securityConfig.isBasicConfig()) {
            for (User u : securityConfig.getBasicConfiguration().getUsers()) {
                u.setNewRecord(false);
            }
            
            for (Role r : securityConfig.getBasicConfiguration().getRoles()) {
                r.setNewRecord(false);
            }
        }
        
        try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
            fos.write(getGson(true).toJson(securityConfig).getBytes());
        }

        config.setSecurityConfig(securityConfig);
        
        return retval;
    }

}
