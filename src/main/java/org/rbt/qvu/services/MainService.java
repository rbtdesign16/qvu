
package org.rbt.qvu.services;

import java.util.List;
import org.rbt.qvu.client.utils.OperationResult;
import org.rbt.qvu.client.utils.Role;
import org.rbt.qvu.client.utils.User;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;

public interface MainService {
    public AuthData loadAuthData() throws Exception;
    public List<DataSourceConfiguration> loadDatasources();

    public OperationResult saveDatasource(DataSourceConfiguration datasource);
    public OperationResult deleteDatasource(String datasourceName);

    public OperationResult saveRole(Role role);
    public OperationResult deleteRole(String roleName);

    public OperationResult saveUser(User user);
    public OperationResult deleteUser(String userId);
    
    public String loadLang(String langkey);
}
