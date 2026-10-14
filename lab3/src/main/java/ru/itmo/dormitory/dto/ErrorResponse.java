package ru.itmo.dormitory.dto;

import java.util.List;

// { "error": { "code": "...", "message": "...", "details": [...] } }
public class ErrorResponse {

    public ErrorBody error;

    public static ErrorResponse of(String code, String message) {
        return of(code, message, null);
    }

    public static ErrorResponse of(String code, String message, List<FieldError> details) {
        ErrorResponse response = new ErrorResponse();
        response.error = new ErrorBody();
        response.error.code = code;
        response.error.message = message;
        response.error.details = details;
        return response;
    }

    public static class ErrorBody {
        public String code;
        public String message;
        public List<FieldError> details;
    }

    public static class FieldError {
        public String field;
        public String message;

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }
}
