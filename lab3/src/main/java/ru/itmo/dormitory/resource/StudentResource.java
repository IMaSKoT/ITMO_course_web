package ru.itmo.dormitory.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.security.enterprise.SecurityContext;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import ru.itmo.dormitory.dto.PageResponse;
import ru.itmo.dormitory.dto.StudentFilter;
import ru.itmo.dormitory.dto.StudentRequest;
import ru.itmo.dormitory.dto.StudentResponse;
import ru.itmo.dormitory.service.StudentService;

import java.util.logging.Logger;

@Path("/students")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"USER", "ADMIN"})
@Tag(name = "Students", description = "Работа со студентами общежития")
@SecurityRequirement(name = "bearerAuth")
public class StudentResource {

    private static final Logger LOG = Logger.getLogger(StudentResource.class.getName());
    private static final String BODY_REQUIRED = "Тело запроса обязательно";

    @Inject
    private StudentService studentService;

    @Inject
    private SecurityContext securityContext;

    @GET
    @Operation(summary = "Список студентов: поиск по ФИО, фильтры, сортировка, пагинация")
    public PageResponse<StudentResponse> getStudents(@Valid @BeanParam StudentFilter filter) {
        return studentService.getStudents(filter);
    }

    @QUERY
    public PageResponse<StudentResponse> queryStudents(@NotNull(message = BODY_REQUIRED) @Valid StudentFilter filter) {
        return studentService.getStudents(filter);
    }

    @GET
    @Path("/{isuId}")
    @Operation(summary = "Один студент по номеру ИСУ")
    public StudentResponse getStudent(@PathParam("isuId") int isuId) {
        return studentService.getStudent(isuId);
    }

    @POST
    @RolesAllowed("ADMIN")
    @Operation(summary = "Создать студента (только ADMIN)")
    public Response create(@NotNull(message = BODY_REQUIRED) @Valid StudentRequest request) {
        LOG.info("POST student by " + currentUser());
        StudentResponse created = studentService.create(request);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{isuId}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Полностью заменить данные студента (только ADMIN)")
    public StudentResponse replace(@PathParam("isuId") int isuId,
                                   @NotNull(message = BODY_REQUIRED) @Valid StudentRequest request) {
        LOG.info("PUT student " + isuId + " by " + currentUser());
        return studentService.replace(isuId, request);
    }

    @PATCH
    @Path("/{isuId}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Изменить только переданные поля студента (только ADMIN)")
    public StudentResponse patch(@PathParam("isuId") int isuId,
                                 @NotNull(message = BODY_REQUIRED) JsonObject changes) {
        LOG.info("PATCH student " + isuId + " by " + currentUser());
        return studentService.patch(isuId, changes);
    }

    @DELETE
    @Path("/{isuId}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Удалить студента (только ADMIN)")
    public Response delete(@PathParam("isuId") int isuId) {
        LOG.info("DELETE student " + isuId + " by " + currentUser());
        studentService.delete(isuId);
        return Response.noContent().build();
    }

    private String currentUser() {
        return securityContext.getCallerPrincipal().getName();
    }
}
