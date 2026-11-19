package com.way2care.inventorymanagement.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ProductionStage {
    SEALING,
    FINAL_CUTTING,
    FOLDING,
    PACKING;

    @JsonCreator
    public static ProductionStage fromString(String value) {
        for (ProductionStage stage : ProductionStage.values()) {
            if (stage.name().equalsIgnoreCase(value)) {
                return stage;
            }
        }
        throw new IllegalArgumentException("Unknown production stage: " + value);
    }
}
