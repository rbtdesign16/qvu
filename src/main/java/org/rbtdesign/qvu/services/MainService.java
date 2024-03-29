package org.rbtdesign.qvu.services;

import java.util.List;
import java.util.Map;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.client.utils.Role;
import org.rbtdesign.qvu.client.utils.User;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.configuration.document.DocumentSchedulesConfiguration;
import org.rbtdesign.qvu.dto.AuthData;
import org.rbtdesign.qvu.dto.ColumnSettings;
import org.rbtdesign.qvu.dto.DocumentGroup;
import org.rbtdesign.qvu.dto.DocumentNode;
import org.rbtdesign.qvu.dto.DocumentWrapper;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.ForeignKeySettings;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryDocumentRunWrapper;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.QuerySelectNode;
import org.rbtdesign.qvu.dto.ReportDesignSettings;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.SystemSettings;
import org.rbtdesign.qvu.dto.Table;
import org.rbtdesign.qvu.dto.TableColumnNames;
import org.rbtdesign.qvu.dto.TableSettings;
import org.springframework.web.bind.annotation.RequestBody;

public interface MainService {
    public AuthData loadAuthData() throws Exception;

    public List<DataSourceConfiguration> loadDatasources();

    public List<DocumentGroup> loadDocumentGroups();

    public OperationResult saveDatasource(DataSourceConfiguration datasource);

    public OperationResult deleteDatasource(String datasourceName);

    public OperationResult testDatasource(DataSourceConfiguration datasource);

    public OperationResult saveDocumentGroup(DocumentGroup group);

    public OperationResult deleteDocumentGroup(String groupName);

    public OperationResult saveRole(Role role);

    public OperationResult deleteRole(String roleName);

    public OperationResult saveUser(User user);

    public OperationResult deleteUser(String userId);

    public String loadLang(String langkey);

    public OperationResult initializeRepository(String repositoryFolder);

    public OperationResult verifyInitialRepositoryFolder(String folder);

    public OperationResult<List<Table>> getDatasourceTables(String datasourceName);

    public OperationResult<List<TableSettings>> getTableSettings(DataSourceConfiguration ds);

    public OperationResult<List<ColumnSettings>> getColumnSettings(DataSourceConfiguration ds, String tableName);

    public OperationResult<List<ForeignKeySettings>> getForeignKeySettings(DataSourceConfiguration ds, String tableName);

    public OperationResult<QuerySelectNode> getDatasourceTreeViewData(String datasourceName);

    public OperationResult<List<TableColumnNames>> getDatasourceTableNames(String datasourceName);

    public OperationResult getDocument(String type, String group, String name);

    public OperationResult<DocumentWrapper> saveDocument(@RequestBody DocumentWrapper doc);

    public OperationResult deleteDocument(String type, String group, String name);

    public OperationResult<QueryResult> runQuery(QueryDocumentRunWrapper runWrapper);

    public OperationResult<QueryResult> runQuery(QueryRunWrapper runWrapper);

    public byte[] exportToExcel(ExcelExportWrapper wrapper);

    public OperationResult<DocumentNode> getAvailableDocuments(String documentType);

    public OperationResult<List<Map<String, Object>>> runJsonQuery(QueryRunWrapper runWrapper);
    
    public OperationResult<List<Map<String, Object>>> runJsonObjectGraphQuery(QueryRunWrapper runWrapper);

    public OperationResult<SystemSettings> getSystemSettings();
    
    public OperationResult saveSystemSettings(SystemSettings systemSettings);
    
    public OperationResult<String> doBackup();
    
    public OperationResult<DocumentSchedulesConfiguration> getDocumentSchedules();
    
    public OperationResult saveDocumentSchedules(DocumentSchedulesConfiguration schedules);
    
    public OperationResult updateUserPassword(String pass);
    
    public OperationResult<ReportDesignSettings> getReportDesignSettings();
    public OperationResult<ReportDocument> getReportDocument(String group, String name, String user);

}
