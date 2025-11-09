from datetime import datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.types import JSON, Text, Boolean


Base = declarative_base()


class LaborLawRule(Base):
    __tablename__ = 'labor_law_rules'
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(120), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    category = Column(String(80), nullable=False)
    severity = Column(String(40), nullable=False)
    parameters = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    active_from = Column(Date, nullable=True)
    active_to = Column(Date, nullable=True)


class Holiday(Base):
    __tablename__ = 'holidays'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)
    name = Column(String(120), nullable=False)
    coverage_overrides = Column(JSON, nullable=True)
    store_closed = Column(Boolean, default=False)


class StaffingRequirementTemplate(Base):
    __tablename__ = 'staffing_requirement_templates'
    id = Column(Integer, primary_key=True, index=True)
    day_type = Column(String(80), nullable=False)
    shift_id = Column(Integer, ForeignKey('zmiany.id'), nullable=False)
    role_id = Column(Integer, ForeignKey('role.id'), nullable=False)
    min_staff = Column(Integer, default=0)
    target_staff = Column(Integer, default=0)
    max_staff = Column(Integer, nullable=True)
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)


class ReportSnapshot(Base):
    __tablename__ = 'report_snapshots'
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey('grafiki_miesieczne.id'), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    metrics = Column(JSON, nullable=True)
    absence_summary = Column(JSON, nullable=True)
    format = Column(String(40), nullable=False)
    storage_path = Column(String(255), nullable=True)


class Rola(Base):
    __tablename__ = "role"

    id = Column(Integer, primary_key=True, index=True)
    nazwa_roli = Column(String(120), nullable=False)
    minimalna_obsada = Column(Integer, nullable=True)
    maksymalna_obsada = Column(Integer, nullable=True)

    pracownicy = relationship(
        "Pracownik",
        back_populates="rola",
        cascade="all, delete-orphan",
    )


class Pracownik(Base):
    __tablename__ = "pracownicy"

    id = Column(Integer, primary_key=True, index=True)
    imie = Column(String(80), nullable=False)
    nazwisko = Column(String(120), nullable=False)
    rola_id = Column(Integer, ForeignKey("role.id"), nullable=True)
    etat = Column(String(32), nullable=True)
    limit_godzin_miesieczny = Column(Integer, nullable=True)
    preferencje = Column(JSON, nullable=True)
    data_zatrudnienia = Column(Date, nullable=True)

    rola = relationship("Rola", back_populates="pracownicy")
    wpisy = relationship("GrafikEntry", back_populates="pracownik")
    nieobecnosci = relationship(
        "Nieobecnosc",
        back_populates="pracownik",
        cascade="all, delete-orphan",
    )


class Zmiana(Base):
    __tablename__ = "zmiany"

    id = Column(Integer, primary_key=True, index=True)
    nazwa_zmiany = Column(String(120), nullable=False)
    godzina_rozpoczecia = Column(Time, nullable=False)
    godzina_zakonczenia = Column(Time, nullable=False)
    wymagana_obsada = Column(JSON, nullable=True)

    wpisy = relationship("GrafikEntry", back_populates="zmiana")


class GrafikMiesieczny(Base):
    __tablename__ = "grafiki_miesieczne"

    id = Column(Integer, primary_key=True, index=True)
    miesiac_rok = Column(String(20), nullable=False)
    status = Column(String(40), nullable=False, default="roboczy")
    data_utworzenia = Column(DateTime, default=datetime.utcnow, nullable=False)

    entries = relationship(
        "GrafikEntry",
        back_populates="grafik",
        cascade="all, delete-orphan",
    )


class GrafikEntry(Base):
    __tablename__ = "grafik_entries"

    id = Column(Integer, primary_key=True, index=True)
    grafik_miesieczny_id = Column(
        Integer,
        ForeignKey("grafiki_miesieczne.id"),
        nullable=False,
    )
    pracownik_id = Column(Integer, ForeignKey("pracownicy.id"), nullable=False)
    data = Column(Date, nullable=False)
    zmiana_id = Column(Integer, ForeignKey("zmiany.id"), nullable=False)

    grafik = relationship("GrafikMiesieczny", back_populates="entries")
    pracownik = relationship("Pracownik", back_populates="wpisy")
    zmiana = relationship("Zmiana", back_populates="wpisy")


class Nieobecnosc(Base):
    __tablename__ = "nieobecnosci"

    id = Column(Integer, primary_key=True, index=True)
    pracownik_id = Column(Integer, ForeignKey("pracownicy.id"), nullable=False)
    typ_nieobecnosci = Column(String(80), nullable=False)
    data_od = Column(Date, nullable=False)
    data_do = Column(Date, nullable=False)

    pracownik = relationship("Pracownik", back_populates="nieobecnosci")


class GeneratorParameter(Base):
    __tablename__ = "generator_parameters"

    id = Column(Integer, primary_key=True, index=True)
    scenario_type = Column(String(80), nullable=False, unique=True)
    weights = Column(JSON, nullable=False)
    max_consecutive_nights = Column(Integer, nullable=True)
    min_rest_hours_override = Column(Integer, nullable=True)
    last_updated_by = Column(String(120), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



class WzorceHistoryczne(Base):
    __tablename__ = "wzorce_historyczne"

    id = Column(Integer, primary_key=True, index=True)
    nazwa_wzorca = Column(String(120), nullable=False, unique=True)
    dane_grafiku = Column(JSON, nullable=False)
