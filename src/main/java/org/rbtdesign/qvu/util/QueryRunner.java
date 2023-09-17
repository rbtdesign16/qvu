package org.rbtdesign.qvu.util;

import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.services.MainService;

/**
 *
 * @author rbtuc
 */
public class QueryRunner implements Runnable {
    private MainService service;
    private ScheduledDocument document;
    public QueryRunner(MainService service, ScheduledDocument document) {
        this.service = service;
        this.document = document;
    }
    
    @Override
    public void run() {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
    
}
