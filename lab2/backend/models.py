from dataclasses import dataclass
from datetime import date

@dataclass
class Student:
    fullName: str
    group: str
    isuId: int
    dormitory: int | None = None
    room: int | None = None
    settlementPeriod: date | None = None
    isForeign: bool = False
    notes: str = ""
    