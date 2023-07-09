
package org.rbt.qvu.services;

import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.InitialSetup;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableSettings;

public interface MainService {
    public AuthData loadAuthData() throws Exception;
    public List<DataSourceConfiguration> loadDatasources();

    public OperationResult saveDatasource(DataSourceConfiguration datasource);
    public OperationResult deleteDatasource(String datasourceName);
    public OperationResult testDatasource(DataSourceConfiguration datasource);

    public OperationResult saveRole(Role role);
    public OperationResult deleteRole(String roleName);

    public OperationResult saveUser(User user);
    public OperationResult deleteUser(String userId);
    
    public String loadLang(String langkey);
    
    public OperationResult doInitialSetup(InitialSetup initialSetup);
    public OperationResult verifyInitialRepositoryFolder(String folder);
    
    public OperationResult<List<Table>> getDatasourceTables(String datasourceName);
    public OperationResult<List <TableSettings>> getTableSettings(DataSourceConfiguration ds);
    
    
   
}
