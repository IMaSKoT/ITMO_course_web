from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class StudentCreateDTO(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid"
    )

    fullName: str = Field(
        pattern=r"^[А-Яа-яЁё-]{2,43} [А-Яа-яЁё-]{2,45}(?: [А-Яа-яЁё]{2,45})?$"
    )

    group: str = Field(
        pattern=r"^[A-Z][1-9][0-9]{3}$"
    )

    isuId: int = Field(
        ge=100000,
        le=999999
    )

    dormitory: int | None = Field(
        default=None,
        ge=1,
        le=999
    )

    room: int | None = Field(
        default=None,
        ge=1,
        le=9999
    )

    settlementPeriod: date | None = Field(
        default=None,
        ge=date(2000, 1, 1)
    )

    isForeign: bool = False

    notes: str = Field(
        default="",
        max_length=1000
    )