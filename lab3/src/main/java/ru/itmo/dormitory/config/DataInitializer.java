package ru.itmo.dormitory.config;

import jakarta.annotation.sql.DataSourceDefinition;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import ru.itmo.dormitory.dto.StudentRequest;
import ru.itmo.dormitory.service.AuthService;
import ru.itmo.dormitory.service.StudentService;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * 1) описывает подключение к БД (DataSource)
 *    адрес, логин и пароль берутся из переменных окружения через ${ENV=...},
 *    эту подстановку делает Payara
 * 2) при старте приложения создаёт администратора и заполняет таблицу студентов,
 *    если она пустая
 *    делаем это в событии @Initialized(ApplicationScoped.class), а не в @PostConstruct:
 *    к этому моменту все бины готовы и @Transactional работает
 */
@DataSourceDefinition(
        name = "java:app/jdbc/dormitory",
        className = "org.postgresql.ds.PGSimpleDataSource",
        url = "${ENV=DB_URL}",
        user = "${ENV=DB_USER}",
        password = "${ENV=DB_PASSWORD}"
)
@ApplicationScoped
public class DataInitializer {

    private static final Logger LOG = Logger.getLogger(DataInitializer.class.getName());

    @Inject
    AuthService authService;

    @Inject
    StudentService studentService;

    @Inject
    @ConfigProperty(name = "admin.username", defaultValue = "admin")
    String adminUsername;

    @Inject
    @ConfigProperty(name = "admin.email", defaultValue = "admin@itmo.ru")
    String adminEmail;

    @Inject
    @ConfigProperty(name = "admin.password")
    Optional<String> adminPassword;

    void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        if (adminPassword.isPresent()) {
            authService.createAdminIfMissing(adminUsername, adminEmail, adminPassword.get());
        } else {
            LOG.warning("ADMIN_PASSWORD не задан — администратор не будет создан");
        }

        try (InputStream in = getClass().getResourceAsStream("/seed/students.json")) {
            Jsonb jsonb = JsonbBuilder.create();
            StudentRequest[] students = jsonb.fromJson(in, StudentRequest[].class);
            studentService.importIfEmpty(Arrays.asList(students));
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Не удалось загрузить начальных студентов", e);
        }
    }
}
