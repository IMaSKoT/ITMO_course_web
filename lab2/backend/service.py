from backend.dto import StudentCreateDTO, StudentPatchDTO, StudentFilterDTO
from backend.models import Student
from backend.errors import DormitoryDataError, DuplicateIsuError, StudentNotFoundError
from backend import repository

def get_students(filters: StudentFilterDTO):
    students = repository.get_all()

    filter_data = filters.model_dump(
        exclude_none=True,
        mode="json"
    )
    has_dormitory = filter_data.pop("hasDormitory", None)

    if has_dormitory is not None:
        students = [
            student for student in students
            if (student.get("dormitory") is not None) == has_dormitory
        ]
    for field, value in filter_data.items():
        if field == "fullName":
            students = [
                student for student in students
                if value.lower() in (student.get(field) or "").lower()
            ]
        else:
            students = [
                student for student in students
                if student.get(field) == value
            ]
    return students

def create_student(data: StudentCreateDTO) -> Student:
    validate_dormitory_data(data)
    existing_student = repository.get_by_isu(data.isuId)
    if existing_student is not None:
        raise DuplicateIsuError(f"Студент с ИСУ {data.isuId} уже существует")
    student = Student(
        fullName = data.fullName,
        group = data.group,
        isuId = data.isuId,
        dormitory=data.dormitory,
        room=data.room,
        settlementPeriod=data.settlementPeriod,
        isForeign=data.isForeign,
        notes=data.notes
    )
    student_dict = student_to_dict(student)
    repository.create(student_dict)
    
    return student

def get_student(isu_id: int):
    student = repository.get_by_isu(isu_id)
    if student is None:
        raise StudentNotFoundError(f"Студент с ИСУ {isu_id} не найден")
    return student

def delete_student(isu_id: int) -> None:
    deleted = repository.delete(isu_id)
    if not deleted:
        raise StudentNotFoundError(f"Студент с ИСУ {isu_id} не найден")
    
def update_student(isu_id: int, data: StudentPatchDTO):
    current_student = repository.get_by_isu(isu_id)

    if current_student is None:
        raise StudentNotFoundError(f"Студент с ИСУ {isu_id} не найден")
    changes = data.model_dump(exclude_unset=True)
    updated_data = current_student | changes

    updated_dto = StudentCreateDTO.model_validate(updated_data)
    validate_dormitory_data(updated_dto)
    if updated_dto.isuId != isu_id:
         existing_student = repository.get_by_isu(updated_dto.isuId)
         if existing_student is not None:
             raise DuplicateIsuError(f"Студент с ИСУ {updated_dto.isuId} уже существует")
    updated_student = Student (
        fullName=updated_dto.fullName,
        group=updated_dto.group,
        isuId=updated_dto.isuId,
        dormitory=updated_dto.dormitory,
        room=updated_dto.room,
        settlementPeriod=updated_dto.settlementPeriod,
        isForeign=updated_dto.isForeign,
        notes=updated_dto.notes
    )
    student_dict = student_to_dict(updated_student)
    repository.update(isu_id, student_dict)
    return updated_student
        

def student_to_dict(student: Student) -> dict:
    return {
        "fullName": student.fullName,
        "group": student.group,
        "isuId": student.isuId,
        "dormitory": student.dormitory,
        "room": student.room,
        "settlementPeriod": (
            student.settlementPeriod.isoformat() if student.settlementPeriod is not None else None
        ),
        "isForeign": student.isForeign,
        "notes": student.notes,
    }
def validate_dormitory_data(data: StudentCreateDTO):
    values = [
        data.dormitory,
        data.room,
        data.settlementPeriod
    ]

    count = sum(value is not None for value in values)
    if count not in (0,3):
        raise DormitoryDataError("Данные об общежитии должны быть заполнены полностью")
    
