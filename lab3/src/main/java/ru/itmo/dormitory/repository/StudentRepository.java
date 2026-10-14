package ru.itmo.dormitory.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import ru.itmo.dormitory.dto.StudentFilter;
import ru.itmo.dormitory.entity.Student;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** слой доступа к данным: только работа с БД через JPA, никакой бизнес-логики */
@ApplicationScoped
public class StudentRepository {

    // поле API -> поле сущности (защищает от подстановки чего попало в ORDER BY)
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "fullName", "s.fullName",
            "group", "s.groupName",
            "isuId", "s.isuId",
            "dormitory", "s.dormitory",
            "room", "s.room",
            "settlementPeriod", "s.settlementPeriod"
    );

    @PersistenceContext(unitName = "dormitoryPU")
    private EntityManager em;

    public Optional<Student> findByIsuId(int isuId) {
        List<Student> result = em.createQuery(
                        "select s from Student s where s.isuId = :isuId", Student.class)
                .setParameter("isuId", isuId)
                .getResultList();
        return result.stream().findFirst();
    }

    public boolean existsByIsuId(int isuId) {
        return findByIsuId(isuId).isPresent();
    }

    public long count() {
        return em.createQuery("select count(s) from Student s", Long.class).getSingleResult();
    }

    public void save(Student student) {
        em.persist(student);
    }

    public void delete(Student student) {
        em.remove(student);
    }

    /** одна страница студентов с учётом поиска, фильтров и сортировки */
    public List<Student> findPage(StudentFilter filter, LocalDate settlementDate) {
        Map<String, Object> params = new HashMap<>();
        String where = buildWhere(filter, settlementDate, params);

        String orderBy = " order by " + SORT_FIELDS.get(filter.sort) + " " + filter.order
                + ", s.id asc"; // второй ключ, чтобы порядок на страницах был стабильным

        TypedQuery<Student> query = em.createQuery("select s from Student s" + where + orderBy, Student.class);
        params.forEach(query::setParameter);

        // пагинация: OFFSET / LIMIT
        query.setFirstResult((filter.page - 1) * filter.size);
        query.setMaxResults(filter.size);
        return query.getResultList();
    }

    /** сколько всего студентов подходит под фильтр (для totalItems / totalPages) */
    public long countFiltered(StudentFilter filter, LocalDate settlementDate) {
        Map<String, Object> params = new HashMap<>();
        String where = buildWhere(filter, settlementDate, params);

        TypedQuery<Long> query = em.createQuery("select count(s) from Student s" + where, Long.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    /**
     * собираем WHERE из тех фильтров, которые пришли
     * значения передаются параметрами (:name), а не склейкой строк, это защита от SQL-инъекций
     */
    private String buildWhere(StudentFilter filter, LocalDate settlementDate, Map<String, Object> params) {
        StringBuilder where = new StringBuilder(" where 1 = 1");

        if (filter.fullName != null) {
            // поиск по подстроке без учёта регистра
            where.append(" and lower(s.fullName) like :fullName");
            params.put("fullName", "%" + filter.fullName.trim().toLowerCase() + "%");
        }
        if (filter.group != null) {
            where.append(" and s.groupName = :group");
            params.put("group", filter.group);
        }
        if (filter.isuId != null) {
            where.append(" and s.isuId = :isuId");
            params.put("isuId", filter.isuId);
        }
        if (filter.hasDormitory != null) {
            where.append(filter.hasDormitory ? " and s.dormitory is not null" : " and s.dormitory is null");
        }
        if (filter.dormitory != null) {
            where.append(" and s.dormitory = :dormitory");
            params.put("dormitory", filter.dormitory);
        }
        if (filter.room != null) {
            where.append(" and s.room = :room");
            params.put("room", filter.room);
        }
        if (settlementDate != null) {
            where.append(" and s.settlementPeriod = :settlementPeriod");
            params.put("settlementPeriod", settlementDate);
        }
        if (filter.isForeign != null) {
            where.append(" and s.isForeign = :isForeign");
            params.put("isForeign", filter.isForeign);
        }
        return where.toString();
    }
}
