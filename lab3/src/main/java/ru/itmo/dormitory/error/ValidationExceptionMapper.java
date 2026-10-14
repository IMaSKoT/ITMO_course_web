package ru.itmo.dormitory.error;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import ru.itmo.dormitory.dto.ErrorResponse;

import java.util.ArrayList;
import java.util.List;

/** ошибки Bean Validation (@NotNull, @Pattern, ...) -> 422 со списком полей */
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException e) {
        List<ErrorResponse.FieldError> details = new ArrayList<>();
        for (ConstraintViolation<?> violation : e.getConstraintViolations()) {
            details.add(new ErrorResponse.FieldError(
                    fieldName(violation.getPropertyPath()),
                    violation.getMessage()
            ));
        }
        return Response.status(422)
                .type(MediaType.APPLICATION_JSON)
                .entity(ErrorResponse.of("VALIDATION_ERROR", "Некорректные данные запроса", details))
                .build();
    }

    // путь вида "create.request.fullName" -> берём последнюю часть "fullName"
    private String fieldName(Path path) {
        String name = null;
        for (Path.Node node : path) {
            name = node.getName();
        }
        return name;
    }
}
