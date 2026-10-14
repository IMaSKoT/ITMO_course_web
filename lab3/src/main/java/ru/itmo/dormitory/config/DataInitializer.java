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
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

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
    private AuthService authService;

    @Inject
    private StudentService studentService;

    @Inject
    @ConfigProperty(name = "admin.username", defaultValue = "admin")
    private String adminUsername;

    @Inject
    @ConfigProperty(name = "admin.email", defaultValue = "admin@itmo.ru")
    private String adminEmail;

    @Inject
    @ConfigProperty(name = "admin.password")
    private Optional<String> adminPassword;

    void onStart(@Observes @Initialized(ApplicationScoped.class) Object event) {
        createAdmin();
        importStudents();
    }

    private void createAdmin() {
        if (adminPassword.isEmpty()) {
            LOG.warning("ADMIN_PASSWORD is not set, admin user will not be created");
            return;
        }
        authService.createAdminIfMissing(adminUsername, adminEmail, adminPassword.get());
    }

    private void importStudents() {
        try (Jsonb jsonb = JsonbBuilder.create();
             InputStream in = getClass().getResourceAsStream("/seed/students.json")) {
            StudentRequest[] students = jsonb.fromJson(in, StudentRequest[].class);
            studentService.importIfEmpty(List.of(students));
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to import seed students", e);
        }
    }
}
