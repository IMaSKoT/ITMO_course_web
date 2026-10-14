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

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class.getName());
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int BCRYPT_COST = 12;

    @Inject
    private UserRepository userRepository;

    @Inject
    private RefreshTokenRepository refreshTokenRepository;

    @Inject
    private JwtService jwtService;

    @Inject
    @ConfigProperty(name = "jwt.refresh-ttl-days", defaultValue = "7")
    private long refreshTtlDays;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.username.trim();
        String email = request.email.trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw ApiException.conflict("USERNAME_TAKEN", "Имя пользователя " + username + " уже занято");
        }
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_TAKEN", "Email " + email + " уже зарегистрирован");
        }

        User user = new User(username, email, hashPassword(request.password), Role.USER);
        userRepository.save(user);

        LOG.info("Registered new user: " + username);
        return UserResponse.from(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username.trim()).orElse(null);

        // одна ошибка на "нет такого пользователя" и "неверный пароль",
        // чтобы по ответу нельзя было подобрать существующие логины
        if (user == null || !BCrypt.checkpw(request.password, user.getPasswordHash())) {
            LOG.warning("Failed login attempt for username: " + request.username);
            throw ApiException.unauthorized("INVALID_CREDENTIALS", "Неверное имя пользователя или пароль");
        }

        LOG.info("User logged in: " + user.getUsername());
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByHash(sha256(refreshToken))
                .filter(RefreshToken::isActive)
                .orElseThrow(() -> ApiException.unauthorized("INVALID_REFRESH_TOKEN",
                        "Refresh-токен недействителен или истёк, войдите заново"));

        // старый refresh-токен одноразовый, взамен выдаём новую пару
        stored.revoke();
        LOG.info("Tokens refreshed for user: " + stored.getUser().getUsername());
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void createAdminIfMissing(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        userRepository.save(new User(username, email.toLowerCase(), hashPassword(password), Role.ADMIN));
        LOG.info("Created admin user: " + username);
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtService.createAccessToken(user);
        String refreshToken = generateRefreshToken();

        // в БД лежит только хеш refresh-токена, сам токен знает только клиент
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(refreshTtlDays);
        refreshTokenRepository.save(new RefreshToken(sha256(refreshToken), user, expiresAt));

        return new TokenResponse(accessToken, refreshToken);
    }

    private static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_COST));
    }

    private static String generateRefreshToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
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
