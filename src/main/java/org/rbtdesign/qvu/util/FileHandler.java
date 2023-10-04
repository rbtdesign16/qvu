package org.rbtdesign.qvu.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.LineNumberReader;
import java.io.PrintWriter;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.SaveException;
import org.rbtdesign.qvu.client.utils.User;
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.configuration.database.DataSources;
import org.rbtdesign.qvu.configuration.database.DataSourcesConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentGroupsConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentSchedulesConfiguration;
import org.rbtdesign.qvu.configuration.security.SecurityConfiguration;
import org.rbtdesign.qvu.dto.DocumentGroup;
import org.rbtdesign.qvu.dto.DocumentSchedule;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;
import org.rbtdesign.qvu.dto.SystemSettings;
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
    public static final String REPORT_FOLDER = Constants.DOCUMENT_TYPE_REPORT;
    public static final String QUERY_FOLDER = Constants.DOCUMENT_TYPE_QUERY;

    @Autowired
    private ConfigurationHelper config;

    @Autowired
    private DataSources dbDatasources;

    private final Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").disableHtmlEscaping().create();
    private final Gson prettyJson = new GsonBuilder().setPrettyPrinting().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").disableHtmlEscaping().create();

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
        if (LOG.isTraceEnabled()) {
            LOG.trace("Datasources: " + gson.toJson(retval, ArrayList.class));
        }
        return retval;
    }

    public List<DocumentGroup> loadDocumentGroups() {
        List<DocumentGroup> retval = config.getDocumentGroupsConfig().getDocumentGroups();

        DocumentGroup g = new DocumentGroup();
        g.setDescription(Constants.DEFAULT_DOCUMENT_GROUP_DESCRIPTION);
        g.setName(Constants.DEFAULT_DOCUMENT_GROUP);
        g.setDefaultGroup(true);
        retval.add(0, g);
        if (LOG.isTraceEnabled()) {
            LOG.trace("Document Groups: " + gson.toJson(retval, ArrayList.class));
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
                if (datasource.isEnabled()) {
                    dbDatasources.reloadDatasource(datasource);
                }
                retval.setResult(config.getDatasourcesConfig().getDatasources());
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
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
            Errors.populateError(retval, ex);
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
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteDocumentGroup(String groupName, String user) {
        OperationResult retval = new OperationResult();
        DocumentGroupsConfiguration docgroups = null;
        try {
            File dfolder = config.getDocumentGroupsFolder(groupName, user);
            File gbackup = new File(config.getBackupFolder() + File.separator + groupName.replace(" ", "_") + "-deleted-" + Helper.TS2.format(new Date()) + ".zip");

            if (ZipFolder.doZip(dfolder, gbackup)) {
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

                FileUtils.deleteDirectory(dfolder);
            } else {
                Errors.populateError(retval, Errors.BACKUP_FAILED);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
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
            Errors.populateError(retval, ex);
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
                    List<Role> roles = securityConfig.getRoles();
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
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    private void removeRoleFromUsers(SecurityConfiguration securityConfig, String roleName) {
        Iterator<User> it = securityConfig.getUsers().iterator();

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
                    Iterator<Role> it = securityConfig.getRoles().iterator();
                    while (it.hasNext()) {
                        Role r = it.next();
                        if (r.getName().equalsIgnoreCase(roleName)) {
                            removeRoleFromUsers(securityConfig, roleName);
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
            Errors.populateError(retval, ex);
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
                    User curuser = securityConfig.findUser(user.getUserId());
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
                        if (StringUtils.isNotEmpty(user.getPassword())) {
                            user.setPassword(Helper.toMd5Hash(user.getPassword()));
                        }
                        securityConfig.getUsers().add(user);
                    }

                    Collections.sort(securityConfig.getUsers(), new UserComparator());
                }
            }

            if (securityConfig != null) {
                this.saveSecurityConfig(securityConfig);
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
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
                    Iterator<User> it = securityConfig.getUsers().iterator();
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
            Errors.populateError(retval, ex);
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
        for (User u : securityConfig.getUsers()) {
            u.setNewRecord(false);
        }

        for (Role r : securityConfig.getRoles()) {
            r.setNewRecord(false);
        }

        try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
            fos.write(getGson(true).toJson(securityConfig).getBytes());
        }

        config.setSecurityConfig(securityConfig);

        return retval;
    }

    public OperationResult getDocument(String type, String group, String user, String name) {
        OperationResult retval = new OperationResult();

        try {
            File f = config.getDocumentGroupsFolder(group, user);
            File docfile = new File(f.getPath() + File.separator + type + File.separator + name);

            if (!docfile.exists()) {
                retval.setErrorCode(Errors.DOCUMENT_NOT_FOUND);
                retval.setMessage(Errors.getMessage(Errors.DOCUMENT_NOT_FOUND, new String[]{type, name}));
            } else {
                byte[] bytes = FileUtils.readFileToByteArray(docfile);
                QueryDocument doc = gson.fromJson(new String(bytes), QueryDocument.class);
                doc.setSavedDocumentGroupName(doc.getDocumentGroupName());
                retval.setResult(doc);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    public OperationResult<QueryDocument> saveQueryDocument(QueryDocument doc, String user) {
        OperationResult<QueryDocument> retval = new OperationResult();

        try {
            File folder = config.getDocumentGroupsFolder(doc.getDocumentGroupName(), user);
            File originalFile = null;

            // if new document group
            if (StringUtils.isNotEmpty(doc.getSavedDocumentGroupName())
                    && !doc.getSavedDocumentGroupName().equals(doc.getDocumentGroupName())) {
                originalFile = new File(config.getDocumentGroupsFolder(doc.getSavedDocumentGroupName(), user).getPath()
                        + File.separator + QUERY_FOLDER + File.separator + doc.getName());
            }

            String fileName = folder.getPath() + File.separator + QUERY_FOLDER + File.separator + doc.getName();
            if (!fileName.endsWith(".json")) {
                fileName = fileName + ".json";
            }

            File docFile = new File(fileName);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            if (!docFile.getParentFile().exists()) {
                docFile.getParentFile().mkdirs();
            }

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

            if (docFile.exists()) {
                try (FileOutputStream fos = new FileOutputStream(docFile); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(doc).getBytes());
                    // if originalFile is not null then we need to delete it
                    // because we are storing document in new location
                    if (originalFile != null) {
                        FileUtils.delete(originalFile);
                    }

                }
            } else {
                FileUtils.writeStringToFile(docFile, getGson(true).toJson(doc), "UTF-8");
            }
        } catch (SaveException ex) {
            retval = ex.getOpResult();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    public OperationResult<ReportDocument> saveReportDocument(ReportDocument doc, String user) {
        OperationResult<ReportDocument> retval = new OperationResult();

        try {
            File folder = config.getDocumentGroupsFolder(doc.getDocumentGroupName(), user);
            File originalFile = null;

            // if new document group
            if (StringUtils.isNotEmpty(doc.getSavedDocumentGroupName())
                    && !doc.getSavedDocumentGroupName().equals(doc.getDocumentGroupName())) {
                originalFile = new File(config.getDocumentGroupsFolder(doc.getSavedDocumentGroupName(), user).getPath()
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
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    public OperationResult deleteDocument(String type, String group, String user, String name) {
        OperationResult retval = new OperationResult();

        try {
            File f = config.getDocumentGroupsFolder(group, user);
            File doc = new File(f.getPath() + File.separator + type + File.separator + name);

            if (doc.exists()) {
                FileUtils.delete(doc);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        }

        return retval;
    }

    public List<String> getGroupDocumentNames(String type, String group, String user) {
        List<String> retval = new ArrayList();

        File f = config.getDocumentGroupsFolder(group, user);

        if (f.exists() && f.isDirectory()) {
            f = new File(f.getPath() + File.separator + type);
            if (f.exists() && f.isDirectory()) {
                File[] docs = f.listFiles();

                if (docs != null) {
                    for (File d : docs) {
                        if (d.getName().toLowerCase().endsWith(".json")) {
                            retval.add(d.getName());
                        }
                    }
                }
            }
        }

        Collections.sort(retval);
        return retval;
    }

    public OperationResult updateApplicationProperties(SystemSettings systemSettings) {
        OperationResult retval = new OperationResult();

        LineNumberReader lnr = null;
        PrintWriter pw = null;
        List<String> lines = new ArrayList<>();

        try {
            lnr = new LineNumberReader(new FileReader(config.getApplicationPropertiesFileName()));
            String line;
            while ((line = lnr.readLine()) != null) {
                if (systemSettings.getAuthConfig().isModified() && line.contains(Constants.SECURITY_TYPE_PROPERTY)) {
                    lines.add(Constants.SECURITY_TYPE_PROPERTY + "=" + systemSettings.getAuthConfig().getSecurityType());
                } else if (systemSettings.getMiscConfig().isModified() && line.contains(Constants.SERVER_PORT_PROPERTY)) {
                    lines.add(Constants.SERVER_PORT_PROPERTY + "=" + systemSettings.getMiscConfig().getServerPort());
                } else if (systemSettings.getMiscConfig().isModified() && line.contains(Constants.BACKUP_FOLDER_PROPERTY)) {
                    lines.add(Constants.BACKUP_FOLDER_PROPERTY + "=" + systemSettings.getMiscConfig().getBackupFolder());
                } else if (systemSettings.getMiscConfig().isModified() && line.contains(Constants.CORS_ALLOWED_ORIGINS_PROPERTY)) {
                    lines.add(Constants.CORS_ALLOWED_ORIGINS_PROPERTY + "=" + systemSettings.getMiscConfig().getCorsAllowedOrigins());
                } else if (!isSSLProperty(line)) {
                    lines.add(line);
                }
            }

            for (String p : Constants.SSL_PROPERTIES) {
                String val = "";
                switch (p) {
                    case Constants.SSL_ENABLED_PROPERTY:
                        val = "" + systemSettings.getSslConfig().isEnabled();
                        break;
                    case Constants.SSL_KEYSTORE_PROPERTY:
                        val = getKeystoreFileName(systemSettings.getSslConfig().getSslKeyStore());
                        break;
                    case Constants.SSL_KEYSTORE_TYPE_PROPERTY:
                        val = systemSettings.getSslConfig().getSslKeyStoreType();
                        break;
                    case Constants.SSL_KEY_ALIAS_PROPERTY:
                        val = systemSettings.getSslConfig().getSslKeyAlias();
                        break;
                    case Constants.SSL_KEYSTORE_PASSWORD_PROPERTY:
                        val = systemSettings.getSslConfig().getSslKeyStorePassword();
                        break;
                    case Constants.SSL_KEY_PASSWORD_PROPERTY:
                        val = systemSettings.getSslConfig().getSslKeyPassword();
                        break;
                }

                lines.add(p + "=" + val);
            }

            lnr.close();
            lnr = null;

            pw = new PrintWriter(config.getApplicationPropertiesFileName());

            for (String s : lines) {
                pw.println(s);
            }
        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        } finally {
            if (lnr != null) {
                try {
                    lnr.close();
                } catch (Exception ex) {
                };
            }

            if (pw != null) {
                try {
                    pw.close();
                } catch (Exception ex) {
                }
            }
        }

        return retval;
    }

    private String getKeystoreFileName(String input) {
        String retval = input;
        if (StringUtils.isNotEmpty(input)) {
            if (!input.startsWith("file:")) {
                retval = "file:" + input;
            }
        }

        return retval;
    }

    private boolean isSSLProperty(String line) {
        boolean retval = false;
        for (String p : Constants.SSL_PROPERTIES) {
            if (line.contains(p)) {
                retval = true;
                break;
            }
        }

        return retval;
    }

    public OperationResult updateSchedulerProperties(SchedulerConfig schedulerConfig) {
        OperationResult retval = new OperationResult();
        LineNumberReader lnr = null;
        PrintWriter pw = null;
        List<String> lines = new ArrayList<>();
        Map<String, String> updateValues = new HashMap<>();
        try {
            for (String p : Constants.SCHEDULER_PROPERTIES) {
                String value = "";
                switch (p) {
                    case Constants.SCHEDULER_ENABLED_PROPERTY:
                        value = "" + schedulerConfig.isEnabled();
                        break;
                    case Constants.SCHEDULER_MAX_SCHEDULER_POOL_PROPERTY:
                        value = "" + schedulerConfig.getMaxSchedulerPoolSize();
                        break;
                    case Constants.SCHEDULER_EXECUTE_TIMEOUT_PROPERTY:
                        value = "" + schedulerConfig.getSchedulerExecuteTimeoutSeconds();
                        break;
                    case Constants.MAIL_SMTP_AUTH_PROPERTY:
                        value = "" + schedulerConfig.isSmtpAuth();
                        break;
                    case Constants.MAIL_SMTP_STARTTLS_ENABLE_PROPERTY:
                        value = "" + schedulerConfig.isSmtpStartTlsEnable();
                        break;
                    case Constants.MAIL_SMTP_SSL_TRUST_PROPERTY:
                        value = "" + schedulerConfig.getSmtpSslTrust();
                        break;
                    case Constants.MAIL_SMTP_HOST_PROPERTY:
                        value = schedulerConfig.getSmtpHost();
                        break;
                    case Constants.MAIL_SMTP_PORT_PROPERTY:
                        value = "" + schedulerConfig.getSmtpPort();
                        break;
                    case Constants.MAIL_USER_PROPERTY:
                        value = schedulerConfig.getMailUser();
                        break;
                    case Constants.MAIL_PASSWORD_PROPERTY:
                        value = schedulerConfig.getMailPassword();
                        break;
                    case Constants.MAIL_FROM_PROPERTY:
                        value = schedulerConfig.getMailFrom();
                        break;
                    case Constants.MAIL_SUBJECT_PROPERTY:
                        value = schedulerConfig.getMailSubject();
                        break;
                    case Constants.SCHEDULER_FIXED_RATE_SECONDS_PROPERTY:
                        value = Constants.DEFAULT_SCHEDULER_FIXED_RATE_SECONDS;
                        break;
                }

                updateValues.put(p, value);
            }

            lnr = new LineNumberReader(new FileReader(config.getSchedulerPropertiesFileName()));

            String line;
            while ((line = lnr.readLine()) != null) {
                line = line.trim();
                if (!line.startsWith("#")) {
                    int pos = line.indexOf("=");
                    if (pos > -1) {
                        String key = line.substring(0, pos);
                        if (updateValues.containsKey(key)) {
                            lines.add(key + "=" + updateValues.get(key));
                        } else {
                            lines.add(line);
                        }
                    } else {
                        lines.add(line);
                    }
                } else {
                    lines.add(line);
                }
            }

            lnr.close();
            lnr = null;
            pw = new PrintWriter(config.getSchedulerPropertiesFileName());
            for (String l : lines) {
                pw.println(l);
            }
        } catch (Exception ex) {
            Errors.populateError(retval, ex);
        } finally {
            if (lnr != null) {
                try {
                    lnr.close();
                } catch (Exception ex) {
                };
            }
            if (pw != null) {
                try {
                    pw.close();
                } catch (Exception ex) {
                };
            }
        }

        return retval;
    }

    public byte[] getHelpDocument(String lang) {
        byte[] retval = null;

        try {
            File folder = config.getHelpFolder();

            if (folder.exists()) {
                File helpDoc = new File(folder.getPath() + File.separator + "qvu-help-" + lang + ".pdf");

                if (!helpDoc.exists()) {
                    helpDoc = new File(folder.getPath() + File.separator + "qvu-help-en-US.pdf");
                }

                return FileUtils.readFileToByteArray(helpDoc);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);;
        }

        return retval;
    }

    public byte[] getGettingStartedDocument(String lang) {
        byte[] retval = null;

        try {
            File folder = config.getHelpFolder();

            if (folder.exists()) {
                File helpDoc = new File(folder.getPath() + File.separator + "qvu-gettingstarted-" + lang + ".pdf");

                if (!helpDoc.exists()) {
                    helpDoc = new File(folder.getPath() + File.separator + "qvu-gettingstarted-en-US.pdf");
                }

                return FileUtils.readFileToByteArray(helpDoc);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);;
        }

        return retval;
    }

    public List<DocumentSchedule> loadDocumentSchedules() {
        List<DocumentSchedule> retval = config.getDocumentSchedulesConfig().getDocumentSchedules();

        if (LOG.isTraceEnabled()) {
            LOG.trace("Document Schedules: " + gson.toJson(retval, ArrayList.class));
        }

        return retval;

    }

    public OperationResult saveDocumentSchedules(DocumentSchedulesConfiguration docschedules) {
        OperationResult retval = new OperationResult();
        try {
            File f = new File(config.getDocumentSchedulesConfigurationFileName());
            try (FileInputStream fis = new FileInputStream(f); FileChannel channel = fis.getChannel(); FileLock lock = channel.lock(0, Long.MAX_VALUE, true)) {
                byte[] bytes = fis.readAllBytes();
                DocumentSchedulesConfiguration ds = gson.fromJson(new String(bytes), DocumentSchedulesConfiguration.class);

                if (ds != null) {
                    if (docschedules.getLastUpdated() > config.getDocumentSchedulesConfig().getLastUpdated()) {
                        retval.setErrorCode(Errors.RECORD_UPDATED);
                        retval.setMessage(Errors.getMessage(retval.getErrorCode(), new String[]{"document schedules"}));
                    }
                }
            }

            if (retval.isSuccess()) {
                docschedules.setLastUpdated(System.currentTimeMillis());
                try (FileOutputStream fos = new FileOutputStream(f); FileChannel channel = fos.getChannel(); FileLock lock = channel.lock()) {
                    fos.write(getGson(true).toJson(docschedules).getBytes());
                    config.setDocumentSchedulesConfig(docschedules);
                    retval.setErrorCode(OperationResult.SUCCESS);
                }
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
            Errors.populateError(retval, ex);
        }

        return retval;

    }

}
