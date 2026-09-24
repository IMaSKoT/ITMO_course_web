import json
from pathlib import Path

DATA_FILE = Path(__file__).parent / "students.json"


def _read_all() -> list[dict]:
    try:
        with open(DATA_FILE, encoding="utf-8") as f:
            students = json.load(f)
    except FileNotFoundError:
        students = []
    return students



def _write_all(students: list[dict]) -> None:
    with open(DATA_FILE, mode="w", encoding="utf-8") as f:
        json.dump(students, f, ensure_ascii=False, indent=2)


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


if __name__ == "__main__":
    petrov = {
        "fullName": "Петров Пётр Петрович",
        "group": "P3210",
        "isuId": 111111,
        "dormitory": 8,
        "room": 412,
        "settlementPeriod": "2025-09-01",
        "isForeign": False,
        "notes": None,
    }
    li = {
        "fullName": "Ли Вэй",
        "group": "P3211",
        "isuId": 222222,
        "dormitory": None,
        "room": None,
        "settlementPeriod": None,
        "isForeign": True,
        "notes": "Ждёт заселения",
    }

    print("1. Создание")
    print(create(petrov))
    print(create(li))
    print(get_all())

    print("\n2. Поиск существующего")
    print(get_by_isu(111111))

    print("\n3. Поиск несуществующего (ждём None)")
    print(get_by_isu(999999))

    print("\n4. Обновление")
    print(update(111111, {**petrov, "room": 413}))
    print(get_all())

    print("\n5. Обновление несуществующего (ждём None)")
    print(update(999999, {**petrov, "isuId": 999999}))

    print("\n6. Удаление (ждём True)")
    print(delete(222222))
    print(get_all())

    print("\n7. Повторное удаление (ждём False)")
    print(delete(222222))