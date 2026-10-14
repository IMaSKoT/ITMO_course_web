package ru.itmo.dormitory.resource;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import ru.itmo.dormitory.dto.LoginRequest;
import ru.itmo.dormitory.dto.RefreshRequest;
import ru.itmo.dormitory.dto.RegisterRequest;
import ru.itmo.dormitory.dto.TokenResponse;
import ru.itmo.dormitory.dto.UserResponse;
import ru.itmo.dormitory.service.AuthService;

/** регистрация, вход и обновление токена: открытые эндпоинты (без @Secured) */
@Path("/auth")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth", description = "Регистрация, вход и обновление токенов")
public class AuthResource {

    private static final String BODY_REQUIRED = "Тело запроса обязательно";

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    @Operation(summary = "Регистрация нового пользователя (роль USER)")
    public Response register(@NotNull(message = BODY_REQUIRED) @Valid RegisterRequest request) {
        UserResponse user = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @POST
    @Path("/login")
    @Operation(summary = "Вход: возвращает access- и refresh-токены")
    public TokenResponse login(@NotNull(message = BODY_REQUIRED) @Valid LoginRequest request) {
        return authService.login(request);
    }

    @POST
    @Path("/refresh")
    @Operation(summary = "Новый access-токен по refresh-токену")
    public TokenResponse refresh(@NotNull(message = BODY_REQUIRED) @Valid RefreshRequest request) {
        return authService.refresh(request.refreshToken);
    }
}
