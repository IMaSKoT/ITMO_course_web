package ru.itmo.dormitory.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RoleTypeInitializer {

    private static final String SQL = """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
                    CREATE CAST (varchar AS user_role) WITH INOUT AS ASSIGNMENT;
                END IF;

                IF (SELECT data_type FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = 'users'
                      AND column_name = 'role') <> 'USER-DEFINED' THEN
                    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                    ALTER TABLE users ALTER COLUMN role TYPE user_role USING CAST(role AS user_role);
                END IF;
            END $$
            """;

    @PersistenceContext(unitName = "dormitoryPU")
    private EntityManager em;

    @Transactional
    public void apply() {
        em.createNativeQuery(SQL).executeUpdate();
    }
}
