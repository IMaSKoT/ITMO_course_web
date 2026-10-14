package ru.itmo.dormitory.config;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbConfig;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

// null-поля пишем в ответ, на неизвестные поля в запросе отвечаем ошибкой (как extra="forbid" в pydantic)
@Provider
public class JsonbConfigProvider implements ContextResolver<Jsonb> {

    private final Jsonb jsonb = JsonbBuilder.create(new JsonbConfig()
            .withNullValues(true)
            .setProperty("jsonb.fail-on-unknown-properties", true));

    @Override
    public Jsonb getContext(Class<?> type) {
        return jsonb;
    }
}
