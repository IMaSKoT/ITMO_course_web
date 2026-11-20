package ru.itmo.dormitory.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.security.enterprise.SecurityContext;
import jakarta.transaction.Transactional;
import ru.itmo.dormitory.dto.StudentResponse;
import ru.itmo.dormitory.entity.StudentEvent;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class StudentEventRepository {

    private static final Jsonb JSONB = JsonbBuilder.create();

    @PersistenceContext(unitName = "dormitoryPU")
    private EntityManager em;

    @Inject
    private SecurityContext securityContext;

    @Transactional(Transactional.TxType.MANDATORY)
    public void add(String action, int isuId, StudentResponse student) {
        StudentEvent event = new StudentEvent();
        event.payload = JSONB.toJson(Map.of(
                "id", UUID.randomUUID().toString(),
                "time", Instant.now().toString(),
                "action", action,
                "username", securityContext.getCallerPrincipal().getName(),
                "isuId", isuId,
                "student", student));
        em.persist(event);
    }

    @Transactional
    public List<StudentEvent> findPending() {
        return em.createQuery("select e from StudentEvent e order by e.id", StudentEvent.class)
                .setMaxResults(50)
                .getResultList();
    }

    @Transactional
    public void delete(long id) {
        StudentEvent event = em.find(StudentEvent.class, id);
        if (event != null) {
            em.remove(event);
        }
    }
}
