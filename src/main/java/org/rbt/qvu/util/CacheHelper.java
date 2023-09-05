/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.Iterator;
import org.ehcache.Cache;
import org.ehcache.Cache.Entry;
import org.ehcache.CacheManager;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.CacheManagerBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.rbt.qvu.dto.QueryDocument;
import org.rbt.qvu.dto.Table;

/**
 *
 * @author rbtuc
 */
public class CacheHelper {
    private final CacheManager cacheManager;
    public CacheHelper() {
        cacheManager = CacheManagerBuilder
          .newCacheManagerBuilder().build();
        cacheManager.init();

        cacheManager
          .createCache(Constants.TABLE_CACHE_NAME, CacheConfigurationBuilder
            .newCacheConfigurationBuilder(
              String.class, Table.class,
              ResourcePoolsBuilder.heap(Constants.TABLE_CACHE_ENTRIES)));
        
        cacheManager
          .createCache(Constants.QUERY_DOCUMENT_CACHE_NAME, CacheConfigurationBuilder
            .newCacheConfigurationBuilder(
              String.class, QueryDocument.class,
              ResourcePoolsBuilder.heap(Constants.QUERY_DOCUMENT_CACHE_ENTRIES)));


    }

    public Cache<String, Table> getTableCache() {
        return cacheManager.getCache(Constants.TABLE_CACHE_NAME, String.class, Table.class);
    }
    
    public Cache<String, QueryDocument> getQueryDocumentCache() {
        return cacheManager.getCache(Constants.QUERY_DOCUMENT_CACHE_NAME, String.class, QueryDocument.class);
    }
    
    public void clearDatasource(String datasourceName) {
        Cache<String, Table> tcache = getTableCache();
        
        Iterator<Entry<String, Table>> it = tcache.iterator();
        
        String key = datasourceName + ".";
        while (it.hasNext()) {
            if (it.next().getKey().startsWith(key)) {
                it.remove();
            }
        }
    }
        
}