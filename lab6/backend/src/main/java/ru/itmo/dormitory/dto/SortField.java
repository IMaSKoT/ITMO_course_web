package ru.itmo.dormitory.dto;

import jakarta.json.bind.adapter.JsonbAdapter;

public enum SortField {
    FULL_NAME("fullName", "s.fullName"),
    GROUP("group", "s.groupName"),
    ISU_ID("isuId", "s.isuId"),
    DORMITORY("dormitory", "s.dormitory"),
    ROOM("room", "s.room"),
    SETTLEMENT_PERIOD("settlementPeriod", "s.settlementPeriod");

    private final String param;
    private final String column;

    SortField(String param, String column) {
        this.param = param;
        this.column = column;
    }

    public String column() {
        return column;
    }

    public static SortField fromString(String value) {
        for (SortField field : values()) {
            if (field.param.equals(value)) {
                return field;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return param;
    }

    public static class Adapter implements JsonbAdapter<SortField, String> {

        @Override
        public String adaptToJson(SortField field) {
            return field.param;
        }

        @Override
        public SortField adaptFromJson(String value) {
            return fromString(value);
        }
    }
}
