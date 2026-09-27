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
    notes: str | None = Field(
        default=None,
        max_length=1000
    )

class StudentPatchDTO(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid"
    )
    fullName: str | None = Field(
        default=None,
        pattern=r"^[А-Яа-яЁё-]{2,43} [А-Яа-яЁё-]{2,45}(?: [А-Яа-яЁё]{2,45})?$"
    )
    group: str | None = Field(
        default=None,
        pattern=r"^[A-Z][1-9][0-9]{3}$"
    )
    isuId: int | None = Field(
        default=None,
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
    isForeign: bool | None = None

    notes: str | None = Field(
        default=None,
        max_length=1000
    )
class StudentFilterDTO(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid"
    )

    fullName: str | None = Field(
        default=None,
        min_length=1,
        max_length=135
    )

    group: str | None = Field(
        default=None,
        pattern=r"^[A-Z][1-9][0-9]{3}$"
    )

    isuId: int | None = Field(
        default=None,
        ge=100000,
        le=999999
    )
    
    hasDormitory: bool | None = None

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

    isForeign: bool | None = None
    
    