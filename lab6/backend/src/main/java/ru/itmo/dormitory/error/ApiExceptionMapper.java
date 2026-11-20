package ru.itmo.dormitory.error;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import ru.itmo.dormitory.dto.ErrorResponse;

import java.util.logging.Logger;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<ApiException> {

    private static final Logger LOG = Logger.getLogger(ApiExceptionMapper.class.getName());

    @Override
    public Response toResponse(ApiException e) {
        LOG.info("API error " + e.getStatus() + " " + e.getCode() + ": " + e.getMessage());
        return Response.status(e.getStatus())
                .type(MediaType.APPLICATION_JSON)
                .entity(ErrorResponse.of(e.getCode(), e.getMessage()))
                .build();
    }
}
