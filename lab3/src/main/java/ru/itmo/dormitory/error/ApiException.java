package ru.itmo.dormitory.error;

// ошибка с HTTP-статусом и кодом, в JSON её превращает ApiExceptionMapper
public class ApiException extends RuntimeException {

    private final int status;
    private final String code;

    public ApiException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApiException unauthorized(String code, String message) {
        return new ApiException(401, code, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(403, "ACCESS_DENIED", message);
    }

    public static ApiException notFound(String code, String message) {
        return new ApiException(404, code, message);
    }

    public static ApiException conflict(String code, String message) {
        return new ApiException(409, code, message);
    }

    public static ApiException unprocessable(String code, String message) {
        return new ApiException(422, code, message);
    }

    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
