/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.SaveException;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.Config;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.configuration.database.DataSources;
import org.rbt.qvu.configuration.database.DataSourcesConfiguration;
import org.rbt.qvu.configuration.document.DocumentGroupsConfiguration;
import org.rbt.qvu.configuration.security.SecurityConfiguration;
import org.rbt.qvu.dto.DocumentGroup;
import org.rbt.qvu.dto.QueryDocument;
import org.rbt.qvu.dto.ReportDocument;
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
public class FileHandler {
    private static final Logger LOG = LoggerFactory.getLogger(FileHandler.class);
    public static final String REPORT_FOLDER = "report";
    public static final String QUERY_FOLDER = "query";

    @Autowired
    private Config config;

    @Autowired
    private DataSources dbDatasources;

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

    public List<DocumentGroup> loadDocumentGroups() {
        List<DocumentGroup> retval = config.getDocumentGroupsConfig().getDocumentGroups();
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
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"datasources"}));
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
                                retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{datasource.getDatasourceName()}));
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
                dbDatasources.reloadDatasource(datasource);
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

    public OperationResult saveDocumentGroup(DocumentGroup group) {
        OperationResult retval = new OperationResult();
        DocumentGroupsConfiguration docgroups = null;
        try {
            File f = new File(config.getDocumentGroupsConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                docgroups = gson.fromJson(new String(bytes), DocumentGroupsConfiguration.class);

                if (docgroups != null) {
                    if (docgroups.getLastUpdated() > config.getDocumentGroupsConfig().getLastUpdated()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"document groups"}));
                        throw new SaveException(retval);
                    } else {
                        int indx = -1;
                        for (int i = 0; i < docgroups.getDocumentGroups().size(); ++i) {
                            DocumentGroup dg = docgroups.getDocumentGroups().get(i);
                            if (dg.getName().equalsIgnoreCase(group.getName())) {
                                indx = i;
                                break;
                            }
                        }

                        if (indx > -1) {
                            if (group.isNewRecord()) {
                                retval.setErrorCode(OperationResult.RECORD_EXISTS);
                                retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{group.getName()}));
                                throw new SaveException(retval);
                            } else {
                                docgroups.getDocumentGroups().set(indx, group);
                            }
                        } else {
                            docgroups.getDocumentGroups().add(group);
                        }

                        group.setNewRecord(false);
                    }
                }
            }

            if (docgroups != null) {
                Collections.sort(docgroups.getDocumentGroups(), new DocumentGroupComparator());
                docgroups.setLastUpdated(System.currentTimeMillis());
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(docgroups).getBytes());
                }
                config.setDocumentGroupsConfig(docgroups);
                retval.setResult(config.getDocumentGroupsConfig().getDocumentGroups());
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteDocumentGroup(String groupName) {
        OperationResult retval = new OperationResult();
        DocumentGroupsConfiguration docgroups = null;
        try {
            File f = new File(config.getDocumentGroupsConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                docgroups = gson.fromJson(new String(bytes), DocumentGroupsConfiguration.class);

                if (docgroups != null) {
                    Iterator<DocumentGroup> it = docgroups.getDocumentGroups().iterator();
                    while (it.hasNext()) {
                        DocumentGroup dg = it.next();
                        if (dg.getName().equalsIgnoreCase(groupName)) {
                            it.remove();
                            break;
                        }
                    }
                }
            }

            if (docgroups != null) {
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(docgroups).getBytes());
                    config.setDocumentGroupsConfig(docgroups);
                    retval.setErrorCode(OperationResult.SUCCESS);
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;

    }

    public OperationResult saveDocumentGroups(DocumentGroupsConfiguration docgroups) {
        OperationResult retval = new OperationResult();
        try {
            File f = new File(config.getDocumentGroupsConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                DocumentGroupsConfiguration dg = gson.fromJson(new String(bytes), DocumentGroupsConfiguration.class);

                if (dg != null) {
                    if (docgroups.getLastUpdated() > config.getDocumentGroupsConfig().getLastUpdated()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"document groups"}));
                    }
                }
            }

            if (retval.isSuccess()) {
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(docgroups).getBytes());
                    config.setDocumentGroupsConfig(docgroups);
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

    private void removeRoleFromUsers(SecurityConfiguration securityConfig, String roleName) {
        Iterator<User> it = securityConfig.getBasicConfiguration().getUsers().iterator();

        while (it.hasNext()) {
            User u = it.next();
            Iterator<String> it2 = u.getRoles().iterator();
            while (it2.hasNext()) {
                if (it2.next().equalsIgnoreCase(roleName)) {
                    it2.remove();
                    break;
                }
            }
        }
    }

    private void removeRoleFromAliases(SecurityConfiguration securityConfig, String roleName) {
        Iterator<Entry<String, String>> it = securityConfig.getRoleAliases().entrySet().iterator();
        while (it.hasNext()) {
            Entry<String, String> e = it.next();
            if (e.getValue().equalsIgnoreCase(roleName)) {
                it.remove();
            }
        }
    }

    private void removeRoleFromDocumentGroups(DocumentGroupsConfiguration docgroups, String roleName) {
        Iterator<DocumentGroup> it = docgroups.getDocumentGroups().iterator();

        while (it.hasNext()) {
            DocumentGroup dg = it.next();
            Iterator<String> it2 = dg.getRoles().iterator();
            while (it2.hasNext()) {
                if (it2.next().equalsIgnoreCase(roleName)) {
                    it2.remove();
                    break;
                }
            }
        }
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
                            removeRoleFromUsers(securityConfig, roleName);
                            removeRoleFromAliases(securityConfig, roleName);
                            DocumentGroupsConfiguration docgroups = config.getDocumentGroupsConfig();
                            removeRoleFromDocumentGroups(docgroups, roleName);
                            retval = saveDocumentGroups(docgroups);
                            if (retval.isSuccess()) {
                                it.remove();
                            }
                            break;
                        }
                    }
                }
            }

            if ((securityConfig != null) && retval.isSuccess()) {
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
                retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"security configuration"}));
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

    public OperationResult getDocument(String type, String group, String name) {
        OperationResult retval = new OperationResult();

        try {
            File f = config.getDocumentGroupsFolder(group);
            File docfile = new File(f.getPath() + File.separator + type + File.separator + name);

            if (!docfile.exists()) {
                retval.setErrorCode(Errors.DOCUMENT_NOT_FOUND);
                retval.setMessage(Errors.getMessage(Errors.DOCUMENT_NOT_FOUND, new String[]{type, name}));
            } else {
                try (FileInputStream fis = new FileInputStream(docfile); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                    byte[] bytes = fis.readAllBytes();
                    QueryDocument doc = gson.fromJson(new String(bytes), QueryDocument.class);
                    doc.setSavedDocumentGroupName(doc.getDocumentGroupName());
                    retval.setResult(doc);
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

    public OperationResult<QueryDocument> saveQueryDocument(QueryDocument doc) {
        OperationResult<QueryDocument> retval = new OperationResult();

        try {
            File folder =  config.getDocumentGroupsFolder(doc.getDocumentGroupName());
            File originalFile = null;
            
            // if new document group
            if (StringUtils.isNotEmpty(doc.getSavedDocumentGroupName()) 
                    && !doc.getSavedDocumentGroupName().equals(doc.getDocumentGroupName())) {
                originalFile = new File(config.getDocumentGroupsFolder(doc.getSavedDocumentGroupName()).getPath()
                        + File.separator + QUERY_FOLDER + File.separator + doc.getName());
            }

            if (!folder.exists()) {
                folder.mkdirs();
            }

            File docFile = new File(folder.getPath() + File.separator + QUERY_FOLDER + File.separator + doc.getName());

            if (doc.isNewRecord() && docFile.exists()) {
                retval.setErrorCode(OperationResult.RECORD_EXISTS);
                retval.setMessage("query document " + doc.getName() + " already exists");
                throw new SaveException(retval);
            }

            if (docFile.exists()) {
                try (FileInputStream fis = new FileInputStream(docFile); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                    byte[] bytes = fis.readAllBytes();
                    QueryDocument curdoc = gson.fromJson(new String(bytes), QueryDocument.class);

                    if (curdoc.getLastUpdated().getTime() > doc.getLastUpdated().getTime()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"query document"}));
                        throw new SaveException(retval);
                    }
                }
            }

            doc.setLastUpdated(new Timestamp(System.currentTimeMillis()));

            try (FileOutputStream fos = new FileOutputStream(docFile); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                fos.write(getGson(true).toJson(doc).getBytes());
                // if originalFile is not null then we need to delete it
                // because we are storing document in new location
                if (originalFile != null) {
                    FileUtils.delete(originalFile);
                }
                    
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }
    
    public OperationResult<ReportDocument> saveReportDocument(ReportDocument doc) {
        OperationResult<ReportDocument> retval = new OperationResult();

        try {
            File folder =  config.getDocumentGroupsFolder(doc.getDocumentGroupName());
            File originalFile = null;
            
            // if new document group
            if (StringUtils.isNotEmpty(doc.getSavedDocumentGroupName()) 
                    && !doc.getSavedDocumentGroupName().equals(doc.getDocumentGroupName())) {
                originalFile = new File(config.getDocumentGroupsFolder(doc.getSavedDocumentGroupName()).getPath()
                        + File.separator + REPORT_FOLDER + File.separator + doc.getName());
            }

            if (!folder.exists()) {
                folder.mkdirs();
            }

            File docFile = new File(folder.getPath() + File.separator + REPORT_FOLDER + File.separator + doc.getName());

            if (doc.isNewRecord() && docFile.exists()) {
                retval.setErrorCode(OperationResult.RECORD_EXISTS);
                retval.setMessage("report document " + doc.getName() + " already exists");
                throw new SaveException(retval);
            }

            if (docFile.exists()) {
                try (FileInputStream fis = new FileInputStream(docFile); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                    byte[] bytes = fis.readAllBytes();
                    QueryDocument curdoc = gson.fromJson(new String(bytes), QueryDocument.class);

                    if (curdoc.getLastUpdated().getTime() > doc.getLastUpdated().getTime()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"report document"}));
                        throw new SaveException(retval);
                    }
                }
            }

            doc.setLastUpdated(new Timestamp(System.currentTimeMillis()));

            try (FileOutputStream fos = new FileOutputStream(docFile); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                fos.write(getGson(true).toJson(doc).getBytes());
                // if originalFile is not null then we need to delete it
                // because we are storing document in new location
                if (originalFile != null) {
                    FileUtils.delete(originalFile);
                }
                    
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }


    public OperationResult deleteDocument(String type, String group, String name) {
        OperationResult retval = new OperationResult();

        try {
            File f = config.getDocumentGroupsFolder(group);
            File doc = new File(f.getPath() + File.separator + type + File.separator + name);

            if (doc.exists()) {
                FileUtils.delete(doc);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Helper.populateResultError(retval, ex);
        }

        return retval;
    }

}
