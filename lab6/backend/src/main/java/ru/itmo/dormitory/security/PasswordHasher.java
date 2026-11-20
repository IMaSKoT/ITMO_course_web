package ru.itmo.dormitory.security;

import org.mindrot.jbcrypt.BCrypt;

public final class PasswordHasher {

    private static final int BCRYPT_COST = 12;

    private PasswordHasher() {
    }

    public static String hash(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_COST));
    }

    public static boolean matches(String password, String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
