# Data Model

Based on the feature specification, the following data entities have been identified.

## Entities

### Pracownik
Represents an employee.
- **id**: `INTEGER` (Primary Key)
- **imie**: `TEXT`
- **nazwisko**: `TEXT`
- **rola_id**: `INTEGER` (Foreign Key to Rola)
- **etat**: `TEXT` (e.g., "pelny", "pol")
- **limit_godzin_miesieczny**: `INTEGER`
- **preferencje**: `TEXT` (JSON)
- **data_zatrudnienia**: `DATE`

### Rola
Defines a job role within the company.
- **id**: `INTEGER` (Primary Key)
- **nazwa_roli**: `TEXT`
- **minimalna_obsada**: `INTEGER`
- **maksymalna_obsada**: `INTEGER`

### Zmiana
Defines a work shift.
- **id**: `INTEGER` (Primary Key)
- **nazwa_zmiany**: `TEXT`
- **godzina_rozpoczecia**: `TIME`
- **godzina_zakonczenia**: `TIME`
- **wymagana_obsada**: `TEXT` (JSON)

### GrafikMiesieczny
Represents the work schedule for a specific month.
- **id**: `INTEGER` (Primary Key)
- **miesiac_rok**: `TEXT`
- **status**: `TEXT` (e.g., "roboczy", "zatwierdzony")
- **data_utworzenia**: `DATETIME`

### GrafikEntry
Represents a single entry in the schedule.
- **id**: `INTEGER` (Primary Key)
- **grafik_miesieczny_id**: `INTEGER` (Foreign Key to GrafikMiesieczny)
- **pracownik_id**: `INTEGER` (Foreign Key to Pracownik)
- **data**: `DATE`
- **zmiana_id**: `INTEGER` (Foreign Key to Zmiana)

### Nieobecnosc
Represents an employee's absence.
- **id**: `INTEGER` (Primary Key)
- **pracownik_id**: `INTEGER` (Foreign Key to Pracownik)
- **typ_nieobecnosci**: `TEXT`
- **data_od**: `DATE`
- **data_do**: `DATE`

### ParametryGeneratora
Stores generator parameters.
- **id**: `INTEGER` (Primary Key)
- **nazwa_parametru**: `TEXT`
- **wartosc**: `TEXT`

### WzorceHistoryczne
Stores historical schedule patterns.
- **id**: `INTEGER` (Primary Key)
- **nazwa_wzorca**: `TEXT`
- **dane_grafiku**: `TEXT` (JSON)
