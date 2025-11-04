# Wymagania niefunkcjonalne

- Użyteczność:
  - Interfejs w pełni po polsku, z jasnymi komunikatami o błędach i potwierdzeniach akcji.
  - Czytelna legenda kolorów zmian i oznaczeń (weekend, prowadzący, błąd walidacji).
  - Przy generowaniu – feedback w czasie rzeczywistym o stanie procesu (etapy, postęp, komunikaty).

- Wydajność i responsywność:
  - Widoki dla miesięcy z 28–31 dniami i zespołem ~15–20 osób muszą pozostać płynne.
  - Eksporty (CSV/PDF) muszą poprawnie odwzorować aktualny widok.

- Odporność:
  - Przy błędach wejścia do generowania/raportowania – czytelny komunikat i brak blokady innych funkcji.
  - Ponawianie prób i ograniczanie częstotliwości dla zewnętrznych wywołań (generowanie, asystent).

- Spójność danych:
  - Walidacja uruchamiana automatycznie po każdej istotnej zmianie.
  - Zapis grafiku tworzy spójny punkt odniesienia dla raportów i indeksacji do bazy wiedzy.

- Kontrola funkcji:
  - Flagi funkcji muszą pozwalać wyłączać całe sekcje (np. widok osi czasu, panel walidacji, eksporty) bez ingerencji w inne obszary.

## Środowisko, instalacja i dystrybucja (lokalnie, Windows 11)

- Środowisko uruchomieniowe:
  - System docelowy: Windows 11.
  - Tryb pracy: lokalny (offline-first), bez zależności od usług chmurowych.
  - Model użytkowania: jeden użytkownik (single-user) na jednym urządzeniu.

- Przechowywanie danych:
  - Wszystkie dane przechowywane lokalnie na urządzeniu użytkownika.
  - Kopie zapasowe wykonywane ręcznie przez użytkownika (export/import), bez automatycznej synchronizacji w chmurze.

- Dystrybucja i uruchamianie:
  - Możliwość przygotowania i dystrybucji jako samodzielny plik wykonywalny (.exe) dla Windows 11.
  - Instalacja bez uprawnień administracyjnych mile widziana (o ile to możliwe), brak wymaganego stałego dostępu do Internetu.
  - Aktualizacje mogą być stosowane ręcznie (brak wymogu auto-update).
