package ru.itmo.dormitory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "bigserial")
    private Long id;

    @Column(name = "full_name", nullable = false, length = 135)
    private String fullName;

    @Column(name = "study_group", nullable = false, length = 5)
    private String groupName;

    @Column(name = "isu_id", nullable = false, unique = true)
    private Integer isuId;

    @Column(name = "dormitory")
    private Integer dormitory;

    @Column(name = "room")
    private Integer room;

    @Column(name = "settlement_date")
    private LocalDate settlementPeriod;

    @Column(name = "is_foreign", nullable = false)
    private boolean isForeign;

    @Column(name = "notes", length = 1000)
    private String notes;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Integer getIsuId() {
        return isuId;
    }

    public void setIsuId(Integer isuId) {
        this.isuId = isuId;
    }

    public Integer getDormitory() {
        return dormitory;
    }

    public void setDormitory(Integer dormitory) {
        this.dormitory = dormitory;
    }

    public Integer getRoom() {
        return room;
    }

    public void setRoom(Integer room) {
        this.room = room;
    }

    public LocalDate getSettlementPeriod() {
        return settlementPeriod;
    }

    public void setSettlementPeriod(LocalDate settlementPeriod) {
        this.settlementPeriod = settlementPeriod;
    }

    public boolean isForeign() {
        return isForeign;
    }

    public void setForeign(boolean isForeign) {
        this.isForeign = isForeign;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
