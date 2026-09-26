from backend.dto import StudentCreateDTO
from backend.models import Student
from backend.errors import DormitoryDataError, DuplicateIsuError, StudentNotFoundError
from backend import repository

def get_students():
    return repository.get_all()

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
    
