package com.way2care.inventorymanagement.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * Cache configuration for dashboard performance optimization
 * Using in-memory caching for frequently accessed dashboard data
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache("dashboardSummary"),
                new ConcurrentMapCache("stockBreakdown"),
                new ConcurrentMapCache("productionData"),
                new ConcurrentMapCache("salesDashboard")
        ));
        return cacheManager;
    }
}
