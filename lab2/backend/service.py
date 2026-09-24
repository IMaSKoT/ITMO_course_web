from backend.dto import StudentCreateDTO
from backend.models import Student
def get_students():
    return []

def create_student(data: StudentCreateDTO) -> Student:
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
