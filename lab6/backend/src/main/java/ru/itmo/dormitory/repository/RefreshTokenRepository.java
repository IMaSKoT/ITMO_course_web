package ru.itmo.dormitory.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import ru.itmo.dormitory.entity.RefreshToken;

import java.util.Optional;

@ApplicationScoped
public class RefreshTokenRepository {

    private static final String FIND_BY_HASH =
            "select t from RefreshToken t join fetch t.user where t.tokenHash = :hash";

    @PersistenceContext(unitName = "dormitoryPU")
    private EntityManager em;

    public Optional<RefreshToken> findByHash(String tokenHash) {
        return em.createQuery(FIND_BY_HASH, RefreshToken.class)
                .setParameter("hash", tokenHash)
                .getResultList()
                .stream()
                .findFirst();
    }

    public void save(RefreshToken token) {
        em.persist(token);
    }
}
