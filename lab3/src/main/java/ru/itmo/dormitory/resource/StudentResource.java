package ru.itmo.dormitory.resource;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import ru.itmo.dormitory.dto.PageResponse;
import ru.itmo.dormitory.dto.StudentFilter;
import ru.itmo.dormitory.dto.StudentRequest;
import ru.itmo.dormitory.dto.StudentResponse;
import ru.itmo.dormitory.entity.Role;
import ru.itmo.dormitory.security.Secured;
import ru.itmo.dormitory.service.StudentService;

import java.util.logging.Logger;

/**
 * HTTP-слой: принимает запрос, отдаёт ответ, вся логика в StudentService
 * путь /api/requests и идентификатор isuId сохранены из 2-й лабы
 *
 * читать (GET, QUERY) может любой вошедший пользователь, менять только ADMIN
 */
@Path("/requests")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Secured // по умолчанию: USER и ADMIN
@Tag(name = "Students", description = "Работа со студентами общежития")
@SecurityRequirement(name = "bearerAuth")
public class StudentResource {

    private static final Logger LOG = Logger.getLogger(StudentResource.class.getName());

    @Inject
    StudentService studentService;

    @Context
    SecurityContext securityContext;

    @GET
    @Operation(summary = "Список студентов: поиск по ФИО, фильтры, сортировка, пагинация")
    public PageResponse<StudentResponse> getStudents(@Valid @BeanParam StudentFilter filter) {
        return studentService.getStudents(filter);
    }

    // то же, что GET-список, но параметры передаются в JSON-теле
    // без @Operation: в OpenAPI 3.0 нет метода QUERY, и генератор Payara падает на нём с NPE
    @QUERY
    public PageResponse<StudentResponse> queryStudents(
            @NotNull(message = "Тело запроса обязательно") @Valid StudentFilter filter) {
        return studentService.getStudents(filter);
    }

    @GET
    @Path("/{isuId}")
    @Operation(summary = "Один студент по номеру ИСУ")
    public StudentResponse getStudent(@PathParam("isuId") int isuId) {
        return studentService.getStudent(isuId);
    }

    @POST
    @Secured(Role.ADMIN)
    @Operation(summary = "Создать студента (только ADMIN)")
    public Response create(@NotNull(message = "Тело запроса обязательно") @Valid StudentRequest request) {
        LOG.info("POST student by " + currentUser());
        StudentResponse created = studentService.create(request);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{isuId}")
    @Secured(Role.ADMIN)
    @Operation(summary = "Полностью заменить данные студента (только ADMIN)")
    public StudentResponse replace(@PathParam("isuId") int isuId,
                                   @NotNull(message = "Тело запроса обязательно") @Valid StudentRequest request) {
        LOG.info("PUT student " + isuId + " by " + currentUser());
        return studentService.replace(isuId, request);
    }

    @PATCH
    @Path("/{isuId}")
    @Secured(Role.ADMIN)
    @Operation(summary = "Частично изменить студента — передаются только изменяемые поля (только ADMIN)")
    public StudentResponse patch(@PathParam("isuId") int isuId,
                                 @NotNull(message = "Тело запроса обязательно") JsonObject changes) {
        LOG.info("PATCH student " + isuId + " by " + currentUser());
        return studentService.patch(isuId, changes);
    }

    @DELETE
    @Path("/{isuId}")
    @Secured(Role.ADMIN)
    @Operation(summary = "Удалить студента (только ADMIN)")
    public Response delete(@PathParam("isuId") int isuId) {
        LOG.info("DELETE student " + isuId + " by " + currentUser());
        studentService.delete(isuId);
        return Response.noContent().build();
    }

    private String currentUser() {
        return securityContext.getUserPrincipal().getName();
    }
}
