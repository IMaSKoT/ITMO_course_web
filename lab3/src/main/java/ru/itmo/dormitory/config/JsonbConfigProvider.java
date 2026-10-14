package ru.itmo.dormitory.config;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbConfig;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

/**
 * настройки JSON для всего API:
 *  - null-поля тоже попадают в ответ ("dormitory": null), как во 2-й лабе
 *  - неизвестные поля в теле запроса -> ошибка (аналог extra="forbid" в pydantic)
 */
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
