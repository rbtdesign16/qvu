package org.rbtdesign.qvu.util;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import java.util.concurrent.TimeUnit;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.ReportDocument;
import org.rbtdesign.qvu.dto.Table;

/**
 *
 * @author rbtuc
 */
public class CacheHelper {
    private static Cache<String, Table> tableCache;
    private static Cache<String, QueryDocument> queryDocumentCache;
    private static Cache<String, ReportDocument> reportDocumentCache;

    public CacheHelper() {
        tableCache = CacheBuilder.newBuilder()
                .maximumSize(Constants.TABLE_CACHE_ENTRIES)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build();
        queryDocumentCache = CacheBuilder.newBuilder()
                .maximumSize(Constants.QUERY_DOCUMENT_CACHE_ENTRIES)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build();

        reportDocumentCache = CacheBuilder.newBuilder()
                .maximumSize(Constants.REPORT_DOCUMENT_CACHE_ENTRIES)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build();
    }

    public Cache<String, Table> getTableCache() {
        return tableCache;
    }

    public Cache<String, QueryDocument> getQueryDocumentCache() {
        return queryDocumentCache;    }

    public Cache<String, ReportDocument> getReportDocumentCache() {
        return reportDocumentCache;
    }
}
