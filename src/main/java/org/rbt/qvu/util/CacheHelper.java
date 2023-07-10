/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import org.ehcache.Cache;
import org.ehcache.CacheManager;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.CacheManagerBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableSettings;

/**
 *
 * @author rbtuc
 */
public class CacheHelper {
    private CacheManager cacheManager;
    public CacheHelper() {
        cacheManager = CacheManagerBuilder
          .newCacheManagerBuilder().build();
        cacheManager.init();

        cacheManager
          .createCache(Constants.TABLE_CACHE_NAME, CacheConfigurationBuilder
            .newCacheConfigurationBuilder(
              String.class, Table.class,
              ResourcePoolsBuilder.heap(Constants.TABLE_CACHE_ENTRIES)));

    }

    public Cache<String, Table> getTableCache() {
        return cacheManager.getCache(Constants.TABLE_CACHE_NAME, String.class, Table.class);
    }
    
}