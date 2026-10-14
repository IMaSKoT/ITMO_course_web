package ru.itmo.dormitory.error;

import jakarta.json.bind.JsonbException;
import jakarta.ws.rs.NotAllowedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.NotSupportedException;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import ru.itmo.dormitory.dto.ErrorResponse;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * все остальные исключения: битый JSON, несуществующий путь, неверный метод
 * и непредвиденные ошибки сервера (500)
 * ответ отдаётся в том же едином формате
 */
@Provider
public class GenericExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(GenericExceptionMapper.class.getName());

    @Override
    public Response toResponse(Exception e) {
        if (isJsonError(e)) {
            return build(400, "INVALID_JSON", "Тело запроса должно содержать корректный JSON");
        }
        if (e instanceof NotFoundException) {
            return build(404, "NOT_FOUND", "Ресурс не найден");
        }
        if (e instanceof NotAllowedException) {
            return build(405, "METHOD_NOT_ALLOWED", "Метод не поддерживается для этого пути");
        }
        if (e instanceof NotSupportedException) {
            return build(415, "UNSUPPORTED_MEDIA_TYPE", "Ожидается Content-Type: application/json");
        }
        if (e instanceof WebApplicationException wae) {
            int status = wae.getResponse().getStatus();
            if (status < 500) {
                return build(status, "BAD_REQUEST", "Некорректный запрос");
            }
        }
        // всё неожиданное логируем со стектрейсом, а клиенту не показываем детали
        LOG.log(Level.SEVERE, "Unexpected error", e);
        return build(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
    }

    // JSON-B бросает JsonbException, Jersey может обернуть её в ProcessingException
    private boolean isJsonError(Throwable e) {
        while (e != null) {
            if (e instanceof JsonbException || e instanceof ProcessingException) {
                return true;
            }
            e = e.getCause();
        }
        return false;
    }

    private Response build(int status, String code, String message) {
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(ErrorResponse.of(code, message))
                .build();
    }
}
