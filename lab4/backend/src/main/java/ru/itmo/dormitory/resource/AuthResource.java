package ru.itmo.dormitory.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.security.enterprise.SecurityContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import ru.itmo.dormitory.dto.IssuedTokens;
import ru.itmo.dormitory.dto.LoginRequest;
import ru.itmo.dormitory.dto.RegisterRequest;
import ru.itmo.dormitory.dto.TokenResponse;
import ru.itmo.dormitory.dto.UserResponse;
import ru.itmo.dormitory.service.AuthService;

import java.time.Duration;

@Path("/auth")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth", description = "Регистрация, вход и обновление токенов")
public class AuthResource {

    private static final String BODY_REQUIRED = "Тело запроса обязательно";
    private static final String REFRESH_COOKIE = "refreshToken";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    @Inject
    private AuthService authService;

    @Inject
    private SecurityContext securityContext;

    @Inject
    @ConfigProperty(name = "jwt.refresh-ttl-days", defaultValue = "7")
    private long refreshTtlDays;

    @Inject
    @ConfigProperty(name = "auth.cookie-secure", defaultValue = "true")
    private boolean cookieSecure;

    @POST
    @Path("/register")
    @Operation(summary = "Регистрация нового пользователя (роль USER)")
    public Response register(@NotNull(message = BODY_REQUIRED) @Valid RegisterRequest request) {
        UserResponse user = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @POST
    @Path("/login")
    @Operation(summary = "Вход: возвращает access-токен, refresh-токен кладёт в HttpOnly cookie")
    public Response login(@NotNull(message = BODY_REQUIRED) @Valid LoginRequest request) {
        return tokensResponse(authService.login(request));
    }

    @POST
    @Path("/refresh")
    @Operation(summary = "Новые токены по refresh-токену из cookie")
    public Response refresh(@CookieParam(REFRESH_COOKIE) String refreshToken) {
        return tokensResponse(authService.refresh(refreshToken));
    }

    @POST
    @Path("/logout")
    @Operation(summary = "Выход: отзывает refresh-токен и удаляет cookie")
    public Response logout(@CookieParam(REFRESH_COOKIE) String refreshToken) {
        authService.logout(refreshToken);
        return Response.noContent().cookie(refreshCookie("", 0)).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Данные текущего пользователя")
    public UserResponse me() {
        return authService.getUser(securityContext.getCallerPrincipal().getName());
    }

    private Response tokensResponse(IssuedTokens tokens) {
        int maxAge = Math.toIntExact(Duration.ofDays(refreshTtlDays).toSeconds());
        return Response.ok(new TokenResponse(tokens.accessToken()))
                .cookie(refreshCookie(tokens.refreshToken(), maxAge))
                .build();
    }

    private NewCookie refreshCookie(String value, int maxAge) {
        return new NewCookie.Builder(REFRESH_COOKIE)
                .value(value)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(maxAge)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
    }
}
