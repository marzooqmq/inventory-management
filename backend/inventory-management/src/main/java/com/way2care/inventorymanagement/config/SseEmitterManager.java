package com.way2care.inventorymanagement.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class SseEmitterManager {
    
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    /**
     * Add a new SSE emitter for a specific topic
     */
    public SseEmitter addEmitter(String topic) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        emitters.computeIfAbsent(topic, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        log.info("New SSE emitter added for topic: {}. Total emitters: {}", 
                topic, emitters.get(topic).size());

        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed for topic: {}", topic);
            removeEmitter(topic, emitter);
        });

        emitter.onTimeout(() -> {
            log.debug("SSE emitter timeout for topic: {}", topic);
            removeEmitter(topic, emitter);
        });

        emitter.onError(e -> {
            log.error("SSE emitter error for topic: {}", topic, e);
            removeEmitter(topic, emitter);
        });

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to " + topic));
        } catch (IOException e) {
            log.error("Error sending initial SSE event", e);
            removeEmitter(topic, emitter);
        }

        return emitter;
    }

    /**
     * Remove an emitter from a topic
     */
    private void removeEmitter(String topic, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> topicEmitters = emitters.get(topic);
        if (topicEmitters != null) {
            topicEmitters.remove(emitter);
            log.debug("Emitter removed from topic: {}. Remaining: {}", 
                    topic, topicEmitters.size());
            
            if (topicEmitters.isEmpty()) {
                emitters.remove(topic);
                log.debug("Topic removed as no emitters remaining: {}", topic);
            }
        }
    }

    /**
     * Send event to all emitters subscribed to a topic
     */
    public void sendEvent(String topic, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> topicEmitters = emitters.get(topic);
        
        if (topicEmitters == null || topicEmitters.isEmpty()) {
            log.debug("No emitters for topic: {}", topic);
            return;
        }

        log.debug("Sending event '{}' to {} emitters for topic: {}", 
                eventName, topicEmitters.size(), topic);

        topicEmitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                log.error("Error sending SSE event to emitter", e);
                removeEmitter(topic, emitter);
            }
        });
    }

    /**
     * Get count of active emitters for a topic
     */
    public int getEmitterCount(String topic) {
        CopyOnWriteArrayList<SseEmitter> topicEmitters = emitters.get(topic);
        return topicEmitters != null ? topicEmitters.size() : 0;
    }

    /**
     * Close all emitters for a topic
     */
    public void closeAllEmitters(String topic) {
        CopyOnWriteArrayList<SseEmitter> topicEmitters = emitters.get(topic);
        if (topicEmitters != null) {
            topicEmitters.forEach(SseEmitter::complete);
            emitters.remove(topic);
            log.info("All emitters closed for topic: {}", topic);
        }
    }
}
