from flask import Blueprint, request
from pydantic import ValidationError

from backend.errors import DormitoryDataError, DuplicateIsuError
from backend.dto import StudentCreateDTO
from backend.service import create_student, get_students

api = Blueprint("api", __name__)


@api.get("/requests")
def get_students_route():
    students = get_students()
    return students

@api.post("/requests")
def create_student_route():
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return {
            "error": {
                "code": "INVALID_JSON",
                "message": "Тело запроса должно содержать корректный JSON"
            }
        }, 400
    try:
        dto = StudentCreateDTO.model_validate(data)
    except ValidationError as error:
        return {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Некорректные данные студента",
                "details": error.errors()
            }
        }, 422
    try:
        student = create_student(dto)
    except DormitoryDataError as error:
        return {
            "error": {
                "code": "INVALID_DORMITORY_DATA",
                "message": str(error)
            }
        }, 422
    except DuplicateIsuError as error:
        return {
            "error": {
                "code": "DUPLICATE_ISU",
                "message": str(error)
            }
        }, 409

    return {
        "fullName": student.fullName,
        "group": student.group,
        "isuId": student.isuId,
        "dormitory": student.dormitory,
        "room": student.room,
        "settlementPeriod": (
            student.settlementPeriod.isoformat()
            if student.settlementPeriod is not None
            else None
        ),
        "isForeign": student.isForeign,
        "notes": student.notes
    }, 201

