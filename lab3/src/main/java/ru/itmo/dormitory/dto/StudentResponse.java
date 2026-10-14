package ru.itmo.dormitory.dto;

import ru.itmo.dormitory.entity.Student;

import java.time.LocalDate;

// id из БД наружу не отдаём, студента определяет номер ИСУ
public class StudentResponse {

    public String fullName;
    public String group;
    public Integer isuId;
    public Integer dormitory;
    public Integer room;
    public LocalDate settlementPeriod;
    public boolean isForeign;
    public String notes;

    public static StudentResponse from(Student student) {
        StudentResponse dto = new StudentResponse();
        dto.fullName = student.getFullName();
        dto.group = student.getGroupName();
        dto.isuId = student.getIsuId();
        dto.dormitory = student.getDormitory();
        dto.room = student.getRoom();
        dto.settlementPeriod = student.getSettlementPeriod();
        dto.isForeign = student.isForeign();
        dto.notes = student.getNotes();
        return dto;
    }
}
