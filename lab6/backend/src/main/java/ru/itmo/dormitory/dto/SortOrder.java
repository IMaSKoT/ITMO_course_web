package ru.itmo.dormitory.dto;

import jakarta.json.bind.adapter.JsonbAdapter;

public enum SortOrder {
    ASC,
    DESC;

    public static SortOrder fromString(String value) {
        for (SortOrder order : values()) {
            if (order.name().equalsIgnoreCase(value)) {
                return order;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return name().toLowerCase();
    }

    public static class Adapter implements JsonbAdapter<SortOrder, String> {

        @Override
        public String adaptToJson(SortOrder order) {
            return order.toString();
        }

        @Override
        public SortOrder adaptFromJson(String value) {
            return fromString(value);
        }
    }
}
