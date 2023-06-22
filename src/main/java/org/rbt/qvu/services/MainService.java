
package org.rbt.qvu.services;

import java.util.List;
import org.rbt.qvu.dto.AuthData;

public interface MainService {
    public String getDatabaseInfo(String dsname);
    public List<String> getAllDatabaseInfo();
    public AuthData loadAuthData();

}
