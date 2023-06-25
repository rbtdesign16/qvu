
package org.rbt.qvu.services;

import java.util.List;
import org.rbt.qvu.client.utils.RoleInformation;
import org.rbt.qvu.client.utils.UserInformation;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.AuthData;
import org.rbt.qvu.dto.SaveResult;

public interface MainService {
    public AuthData loadAuthData() throws Exception;
    public List<DataSourceConfiguration> loadDatasources();

    public SaveResult saveDatasource(DataSourceConfiguration datasource);
    public SaveResult deleteDatasource(String datasourceName);

    public SaveResult saveRole(RoleInformation role);
    public SaveResult deleteRole(String roleName);

    public SaveResult saveUser(UserInformation user);
    public SaveResult deleteUser(String userId);
}
