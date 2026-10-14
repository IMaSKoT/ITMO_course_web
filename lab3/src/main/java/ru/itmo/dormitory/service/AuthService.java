package ru.itmo.dormitory.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.mindrot.jbcrypt.BCrypt;
import ru.itmo.dormitory.dto.LoginRequest;
import ru.itmo.dormitory.dto.RegisterRequest;
import ru.itmo.dormitory.dto.TokenResponse;
import ru.itmo.dormitory.dto.UserResponse;
import ru.itmo.dormitory.entity.RefreshToken;
import ru.itmo.dormitory.entity.Role;
import ru.itmo.dormitory.entity.User;
import ru.itmo.dormitory.error.ApiException;
import ru.itmo.dormitory.repository.RefreshTokenRepository;
import ru.itmo.dormitory.repository.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.logging.Logger;

/** регистрация, вход, обновление токенов */
@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class.getName());
    private static final SecureRandom RANDOM = new SecureRandom();
    // "стоимость" BCrypt: каждая единица удваивает время хеширования
    private static final int BCRYPT_COST = 12;

    @Inject
    UserRepository userRepository;

    @Inject
    RefreshTokenRepository refreshTokenRepository;

    @Inject
    JwtService jwtService;

    @Inject
    @ConfigProperty(name = "jwt.refresh-ttl-days", defaultValue = "7")
    long refreshTtlDays;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.username.trim();
        String email = request.email.trim().toLowerCase();

        // уникальность проверяем до вставки, чтобы вернуть понятную ошибку 409
        if (userRepository.existsByUsername(username)) {
            throw ApiException.conflict("USERNAME_TAKEN", "Имя пользователя " + username + " уже занято");
        }
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_TAKEN", "Email " + email + " уже зарегистрирован");
        }

        // BCrypt сам генерирует соль и хранит её внутри строки хеша
        String hash = BCrypt.hashpw(request.password, BCrypt.gensalt(BCRYPT_COST));
        // при регистрации все получают роль USER, ADMIN создаётся при старте приложения
        User user = new User(username, email, hash, Role.USER);
        userRepository.save(user);

        LOG.info("Registered new user: " + username);
        return UserResponse.from(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username.trim()).orElse(null);

        // одна и та же ошибка для "нет пользователя" и "неверный пароль",
        // чтобы нельзя было узнать, какие логины существуют
        if (user == null || !BCrypt.checkpw(request.password, user.getPasswordHash())) {
            LOG.warning("Failed login attempt for username: " + request.username);
            throw ApiException.unauthorized("INVALID_CREDENTIALS", "Неверное имя пользователя или пароль");
        }

        LOG.info("User logged in: " + user.getUsername());
        return issueTokens(user);
    }

    /** новая пара токенов по refresh-токену, без повторного ввода логина и пароля */
    @Transactional
    public TokenResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByHash(sha256(refreshToken))
                .orElseThrow(this::invalidRefresh);
        if (!stored.isActive()) {
            throw invalidRefresh();
        }

        // ротация: старый refresh-токен больше не действует, выдаём новую пару
        stored.revoke();
        LOG.info("Tokens refreshed for user: " + stored.getUser().getUsername());
        return issueTokens(stored.getUser());
    }

    /** создаёт администратора при первом запуске (вызывается из DataInitializer) */
    @Transactional
    public void createAdminIfMissing(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        String hash = BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_COST));
        userRepository.save(new User(username, email.toLowerCase(), hash, Role.ADMIN));
        LOG.info("Created admin user: " + username);
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtService.createAccessToken(user);

        // refresh-токен это просто случайная строка, в БД кладём её хеш
        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(refreshTtlDays);
        refreshTokenRepository.save(new RefreshToken(sha256(refreshToken), user, expiresAt));

        return new TokenResponse(accessToken, refreshToken, jwtService.getAccessTtlSeconds(), UserResponse.from(user));
    }

    private ApiException invalidRefresh() {
        return ApiException.unauthorized("INVALID_REFRESH_TOKEN",
                "Refresh-токен недействителен или истёк, войдите заново");
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
