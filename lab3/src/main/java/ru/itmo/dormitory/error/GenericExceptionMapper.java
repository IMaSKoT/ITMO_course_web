package ru.itmo.dormitory.error;

import jakarta.json.bind.JsonbException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import ru.itmo.dormitory.dto.ErrorResponse;

import java.util.logging.Level;
import java.util.logging.Logger;

// всё, что не поймали другие мапперы: битый JSON, 401 и 403, ошибки JAX-RS и непредвиденные 500
@Provider
public class GenericExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(GenericExceptionMapper.class.getName());

    @Override
    public Response toResponse(Exception e) {
        if (isJsonError(e)) {
            return build(400, "INVALID_JSON", "Тело запроса должно содержать корректный JSON");
        }
        // их бросает проверка @RolesAllowed
        if (e instanceof NotAuthorizedException) {
            return build(401, "AUTHENTICATION_REQUIRED", "Нужен заголовок Authorization: Bearer <accessToken>");
        }
        if (e instanceof ForbiddenException) {
            LOG.warning("Access denied: " + e.getMessage());
            return build(403, "ACCESS_DENIED", "Недостаточно прав для этой операции");
        }
        if (e instanceof NotFoundException) {
            return build(404, "NOT_FOUND", "Ресурс не найден");
        }
        if (e instanceof WebApplicationException) {
            int status = ((WebApplicationException) e).getResponse().getStatus();
            if (status < 500) {
                return build(status, "BAD_REQUEST", "Некорректный запрос");
            }
        }
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
