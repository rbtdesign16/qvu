
package org.rbt.qvu.services;

import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.ColumnSettings;
import org.rbt.qvu.dto.DocumentGroup;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.QueryDocument;
import org.rbt.qvu.dto.QuerySelectNode;
import org.rbt.qvu.dto.ReportDocument;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableColumnNames;
import org.rbt.qvu.dto.TableSettings;
import org.springframework.web.bind.annotation.PathVariable;
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
    
    public OperationResult doInitialSetup(InitialSetup initialSetup);
    public OperationResult verifyInitialRepositoryFolder(String folder);
    
    public OperationResult<List<Table>> getDatasourceTables(String datasourceName);
    public OperationResult<List <TableSettings>> getTableSettings(DataSourceConfiguration ds);
    public OperationResult<List <ColumnSettings>> getColumnSettings(DataSourceConfiguration ds, String tableName);
    public OperationResult<QuerySelectNode> getDatasourceTreeViewData(String datasourceName);
    public OperationResult<List<TableColumnNames>> getDatasourceTableNames(String datasourceName);

    public OperationResult getDocument(String type, String group, String name);
    public OperationResult<ReportDocument> saveReportDocument(@RequestBody ReportDocument doc);
    public OperationResult<QueryDocument> saveQueryDocument(@RequestBody QueryDocument doc);
    public OperationResult deleteDocument(String type, String group, String name);

}
