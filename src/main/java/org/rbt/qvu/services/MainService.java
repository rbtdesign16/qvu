package org.rbt.qvu.services;

import java.util.LinkedHashMap;
import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthConfig;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.ColumnSettings;
import org.rbt.qvu.dto.DocumentGroup;
import org.rbt.qvu.dto.DocumentNode;
import org.rbt.qvu.dto.DocumentWrapper;
import org.rbt.qvu.dto.ExcelExportWrapper;
import org.rbt.qvu.dto.QueryResult;
import org.rbt.qvu.dto.QueryDocumentRunWrapper;
import org.rbt.qvu.dto.QueryRunWrapper;
import org.rbt.qvu.dto.QuerySelectNode;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableColumnNames;
import org.rbt.qvu.dto.TableSettings;
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

    public OperationResult<QuerySelectNode> getDatasourceTreeViewData(String datasourceName);

    public OperationResult<List<TableColumnNames>> getDatasourceTableNames(String datasourceName);

    public OperationResult getDocument(String type, String group, String name);

    public OperationResult<DocumentWrapper> saveDocument(@RequestBody DocumentWrapper doc);

    public OperationResult deleteDocument(String type, String group, String name);

    public OperationResult<QueryResult> runQuery(QueryDocumentRunWrapper runWrapper);

    public OperationResult<QueryResult> runQuery(QueryRunWrapper runWrapper);

    public byte[] exportToExcel(ExcelExportWrapper wrapper);

    public OperationResult<DocumentNode> getAvailableDocuments(String documentType);

    public OperationResult<List<LinkedHashMap<String, Object>>> runDataQuery(QueryRunWrapper runWrapper);

    public OperationResult<AuthConfig> getAuthConfig();
    
    public OperationResult saveAuthConfig(AuthConfig authConfig);

}
