package ru.itmo.dormitory.service;

import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.ejb.TransactionAttribute;
import jakarta.ejb.TransactionAttributeType;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import ru.itmo.dormitory.entity.StudentEvent;
import ru.itmo.dormitory.repository.StudentEventRepository;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Logger;

@Singleton
@Startup
public class StudentEventSender {

    private static final Logger LOG = Logger.getLogger(StudentEventSender.class.getName());
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    @Inject
    private StudentEventRepository repository;

    @Inject
    @ConfigProperty(name = "realtime.url", defaultValue = "http://localhost:4000")
    private String realtimeUrl;

    @Inject
    @ConfigProperty(name = "realtime.token")
    private String serviceToken;

    @Schedule(hour = "*", minute = "*", second = "*/2", persistent = false)
    @TransactionAttribute(TransactionAttributeType.NOT_SUPPORTED)
    public void sendPending() {
        for (StudentEvent event : repository.findPending()) {
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(realtimeUrl + "/internal/events"))
                        .timeout(Duration.ofSeconds(5))
                        .header("Content-Type", "application/json")
                        .header("X-Service-Token", serviceToken)
                        .POST(HttpRequest.BodyPublishers.ofString(event.payload))
                        .build();
                HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
                if (response.statusCode() != 200) {
                    LOG.warning("Событие ожидает повторной отправки: HTTP " + response.statusCode());
                    return;
                }
                repository.delete(event.id);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                LOG.warning("Сервис журнала недоступен, событие сохранено в очереди");
                return;
            }
        }
    }
}
