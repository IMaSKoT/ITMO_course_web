package ru.itmo.dormitory.error;

import jakarta.annotation.Priority;
import jakarta.transaction.TransactionalException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
@Priority(1)
public class TransactionExceptionMapper implements ExceptionMapper<TransactionalException> {

    @Override
    public Response toResponse(TransactionalException exception) {
        return new GenericExceptionMapper().toResponse(exception);
    }
}
