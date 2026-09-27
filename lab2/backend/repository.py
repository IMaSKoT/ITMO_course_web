import json
from pathlib import Path
from backend.errors import StorageError

DATA_FILE = Path(__file__).parent.parent / "data" / "students.json"


def _read_all() -> list[dict]:
    try:
        with open(DATA_FILE, encoding="utf-8") as f:
            students = json.load(f)
    except FileNotFoundError:
        students = []
    except (json.JSONDecodeError, OSError) as error:
        raise StorageError(
            "Не удалось прочитать данные студентов"
        ) from error
    return students



def _write_all(students: list[dict]) -> None:
    try:
        with open(DATA_FILE, mode="w", encoding="utf-8") as f:
            json.dump(students, f, ensure_ascii=False, indent=2)
    except (OSError, TypeError, ValueError) as error:
        raise StorageError(
            "Не удалось прочитать данные студентов"
        ) from error


def get_all() -> list[dict]:
    return _read_all()

def get_by_isu(isu_id: int) -> dict | None:
    for student in _read_all():
        if student["isuId"] == isu_id:
            return student
    return None


def create(student: dict) -> dict:
    _write_all(_read_all() + [student])
    return student


def update(isu_id: int, student: dict) -> dict | None:
    students = _read_all()
    for i in range(len(students)):
        if students[i]["isuId"] == isu_id:
            students[i] = student
            _write_all(students)
            return student
    return None


def delete(isu_id: int) -> bool:
    students = _read_all()
    for i in range(len(students)):
        if students[i]["isuId"] == isu_id:
            students.pop(i)
            _write_all(students)
            return True
    return False