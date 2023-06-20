package org.rbt.qvu.services;

import org.rbt.qvu.configuration.database.DataSources;
import java.util.List;

import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MainServiceImpl implements MainService {

    private static Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    DataSources qvuds;

    @PostConstruct
    private void init() {
        LOG.info("in MainServiceImpl.init()");
    }

    @Override
    public String getDatabaseInfo(String dsname) {
        return qvuds.getDatabaseInfo(dsname);
    }

    @Override
    public List<String> getAllDatabaseInfo() {
        return qvuds.getAllDatabaseInfo();
    }
}
