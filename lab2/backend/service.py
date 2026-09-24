from backend.dto import StudentCreateDTO
from backend.models import Student
from backend.errors import DormitoryDataError

def get_students():
    return []

def create_student(data: StudentCreateDTO) -> Student:
    validate_dormitory_data(data)
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
    return student

def validate_dormitory_data(data: StudentCreateDTO):
    values = [
        data.dormitory,
        data.room,
        data.settlementPeriod
    ]

    count = sum(value is not None for value in values)
    if count not in (0,3):
        raise DormitoryDataError("Данные об общежитии должны быть заполнены полностью")
    
