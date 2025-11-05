use crate::models::{Employee, Shift, Absence, ScheduleEntry};
use tauri::AppHandle;
use serde::{Deserialize, Serialize};

/// Get all employees from the database
#[tauri::command]
pub async fn get_employees(_app: AppHandle) -> Result<Vec<Employee>, String> {
    // STUB IMPLEMENTATION: Returns empty list for MVP
    // Full database integration with tauri-plugin-sql will be implemented in a future phase
    // when persistent storage is required beyond the current in-memory prototype
    Ok(vec![])
}

/// Add a new employee to the database
#[tauri::command]
pub async fn add_employee(employee: Employee, _app: AppHandle) -> Result<Employee, String> {
    // STUB IMPLEMENTATION: Echoes back the employee for MVP
    // Full database persistence will be implemented in a future phase
    Ok(employee)
}

/// Update an existing employee
#[tauri::command]
pub async fn update_employee(employee: Employee, _app: AppHandle) -> Result<Employee, String> {
    // STUB IMPLEMENTATION: Echoes back the employee for MVP
    // Full database persistence will be implemented in a future phase
    Ok(employee)
}

/// Get all shift definitions
#[tauri::command]
pub async fn get_shifts(_app: AppHandle) -> Result<Vec<Shift>, String> {
    // STUB IMPLEMENTATION: Returns empty list for MVP
    // Full database persistence will be implemented in a future phase
    Ok(vec![])
}

/// Update all shift definitions (overwrites existing)
#[tauri::command]
pub async fn update_shifts(_shifts: Vec<Shift>, _app: AppHandle) -> Result<(), String> {
    // STUB IMPLEMENTATION: No-op for MVP
    // Full database persistence will be implemented in a future phase
    Ok(())
}

// Solver-related structures

#[derive(Debug, Serialize, Deserialize)]
pub struct SolverInput {
    pub employees: Vec<Employee>,
    pub shifts: Vec<Shift>,
    pub absences: Vec<Absence>,
    pub date_range: DateRange,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DateRange {
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolverResult {
    pub status: String,
    pub assignments: Vec<ScheduleEntry>,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
}

/// Run local solver (Python + OR-Tools)
#[tauri::command]
pub async fn run_local_solver(
    _start_date: String,
    _end_date: String,
    _app: AppHandle,
) -> Result<SolverResult, String> {
    // This is a placeholder implementation
    // In a full implementation, this would:
    // 1. Fetch employees, shifts, absences from database
    // 2. Serialize to JSON
    // 3. Spawn Python process with solve_schedule.py
    // 4. Pass JSON via stdin
    // 5. Read result from stdout
    // 6. Parse and return SolverResult

    // For now, return a placeholder result
    Ok(SolverResult {
        status: "ERROR".to_string(),
        assignments: vec![],
        warnings: vec![],
        errors: vec!["Solver lokalny nie jest jeszcze w pełni zaimplementowany. Funkcjonalność wymaga uruchomienia skryptu Python z OR-Tools.".to_string()],
    })
}

/// Run Gemini solver (cloud-based AI)
#[tauri::command]
pub async fn run_gemini_solver(
    start_date: String,
    end_date: String,
    _app: AppHandle,
) -> Result<SolverResult, String> {
    use std::env;

    // 1. Get API key from environment variable
    let api_key = match env::var("GEMINI_API_KEY") {
        Ok(key) if !key.is_empty() => key,
        _ => {
            return Ok(SolverResult {
                status: "ERROR".to_string(),
                assignments: vec![],
                warnings: vec![],
                errors: vec![
                    "Brak klucza API Gemini.".to_string(),
                    "Ustaw zmienną środowiskową GEMINI_API_KEY lub dodaj klucz w pliku .env".to_string(),
                    "Klucz można wygenerować na: https://makersuite.google.com/app/apikey".to_string(),
                ],
            });
        }
    };

    // 2. Fetch data from database (placeholder - will use actual DB in production)
    // For now, return error indicating the feature needs database integration

    // 3. Construct prompt for Gemini
    let prompt = format!(
        "Jesteś asystentem do planowania grafików pracowniczych. \
        Wygeneruj optymalny grafik dla okresu od {} do {}. \
        \
        Zasady:\n\
        - Każda zmiana musi mieć wymaganą liczbę pracowników\n\
        - Pracownik nie może pracować podczas nieobecności\n\
        - Zachowaj 11-godzinny odpoczynek między zmianami\n\
        - Jeden pracownik może mieć maksymalnie jedną zmianę dziennie\n\
        \n\
        Zwróć odpowiedź w formacie JSON zgodnym z SolverResult.",
        start_date, end_date
    );

    // 4. Make HTTP request to Gemini API
    let client = reqwest::Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={}",
        api_key
    );

    let request_body = serde_json::json!({
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
        }
    });

    match client.post(&url)
        .json(&request_body)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<serde_json::Value>().await {
                    Ok(json_response) => {
                        // Parse Gemini response
                        // This is a simplified version - production code would need more robust parsing
                        Ok(SolverResult {
                            status: "ERROR".to_string(),
                            assignments: vec![],
                            warnings: vec![],
                            errors: vec![
                                "Gemini API odpowiedziało pomyślnie, ale parsowanie odpowiedzi wymaga dalszej implementacji.".to_string(),
                                format!("Odpowiedź: {:?}", json_response),
                            ],
                        })
                    }
                    Err(e) => Ok(SolverResult {
                        status: "ERROR".to_string(),
                        assignments: vec![],
                        warnings: vec![],
                        errors: vec![format!("Błąd parsowania odpowiedzi Gemini: {}", e)],
                    }),
                }
            } else {
                let status_code = response.status();
                let error_text = response.text().await.unwrap_or_default();
                Ok(SolverResult {
                    status: "ERROR".to_string(),
                    assignments: vec![],
                    warnings: vec![],
                    errors: vec![
                        format!("Błąd API Gemini (kod: {})", status_code),
                        format!("Szczegóły: {}", error_text),
                    ],
                })
            }
        }
        Err(e) => Ok(SolverResult {
            status: "ERROR".to_string(),
            assignments: vec![],
            warnings: vec![],
            errors: vec![format!("Błąd połączenia z Gemini API: {}", e)],
        }),
    }
}

/// Export schedule to CSV format
#[tauri::command]
pub async fn export_schedule_csv(
    schedule_entries: Vec<ScheduleEntry>,
    employees: Vec<Employee>,
    shifts: Vec<Shift>,
) -> Result<String, String> {
    use std::collections::HashMap;

    // Build lookup maps
    let employee_map: HashMap<i32, &Employee> = employees.iter().map(|e| (e.id, e)).collect();
    let shift_map: HashMap<i32, &Shift> = shifts.iter().map(|s| (s.id, s)).collect();

    // Build CSV header
    let mut csv = String::from("Data,Pracownik,Zmiana,Godziny\n");

    // Sort entries by date and employee
    let mut sorted_entries = schedule_entries.clone();
    sorted_entries.sort_by(|a, b| {
        a.date.cmp(&b.date).then_with(|| {
            let emp_a = employee_map.get(&a.employee_id);
            let emp_b = employee_map.get(&b.employee_id);
            match (emp_a, emp_b) {
                (Some(ea), Some(eb)) => {
                    ea.last_name.cmp(&eb.last_name).then_with(|| ea.first_name.cmp(&eb.first_name))
                }
                _ => std::cmp::Ordering::Equal,
            }
        })
    });

    // Add rows
    for entry in sorted_entries {
        let employee = employee_map.get(&entry.employee_id);
        let shift = shift_map.get(&entry.shift_id);

        let employee_name = employee
            .map(|e| format!("{} {}", e.first_name, e.last_name))
            .unwrap_or_else(|| format!("ID {}", entry.employee_id));

        let shift_times = shift
            .map(|s| format!("{} - {}", s.start_time, s.end_time))
            .unwrap_or_else(|| format!("ID {}", entry.shift_id));

        let shift_label = shift
            .map(|s| {
                let days = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
                format!("{}", days.get(s.day_of_week as usize).unwrap_or(&"?"))
            })
            .unwrap_or_else(|| "?".to_string());

        csv.push_str(&format!(
            "{},{},{},{}\n",
            entry.date, employee_name, shift_label, shift_times
        ));
    }

    Ok(csv)
}

/// Export schedule to PDF-ready HTML format
#[tauri::command]
pub async fn export_schedule_pdf_html(
    schedule_entries: Vec<ScheduleEntry>,
    employees: Vec<Employee>,
    shifts: Vec<Shift>,
    start_date: String,
    end_date: String,
) -> Result<String, String> {
    use std::collections::HashMap;

    // Build lookup maps
    let employee_map: HashMap<i32, &Employee> = employees.iter().map(|e| (e.id, e)).collect();
    let shift_map: HashMap<i32, &Shift> = shifts.iter().map(|s| (s.id, s)).collect();

    // Group entries by date
    let mut entries_by_date: HashMap<String, Vec<&ScheduleEntry>> = HashMap::new();
    for entry in &schedule_entries {
        entries_by_date.entry(entry.date.clone()).or_insert_with(Vec::new).push(entry);
    }

    // Build HTML
    let mut html = format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Grafik Pracy</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ text-align: center; }}
        .period {{ text-align: center; color: #666; margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
        tr:nth-child(even) {{ background-color: #f2f2f2; }}
        @media print {{
            body {{ margin: 0; }}
            @page {{ margin: 1cm; }}
        }}
    </style>
</head>
<body>
    <h1>Grafik Pracy</h1>
    <div class="period">Okres: {} - {}</div>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Pracownik</th>
                <th>Zmiana</th>
                <th>Godziny</th>
            </tr>
        </thead>
        <tbody>
"#,
        start_date, end_date
    );

    // Sort dates
    let mut dates: Vec<String> = entries_by_date.keys().cloned().collect();
    dates.sort();

    // Add rows grouped by date
    for date in dates {
        if let Some(entries) = entries_by_date.get(&date) {
            let mut sorted_entries = entries.clone();
            sorted_entries.sort_by(|a, b| {
                let emp_a = employee_map.get(&a.employee_id);
                let emp_b = employee_map.get(&b.employee_id);
                match (emp_a, emp_b) {
                    (Some(ea), Some(eb)) => {
                        ea.last_name.cmp(&eb.last_name).then_with(|| ea.first_name.cmp(&eb.first_name))
                    }
                    _ => std::cmp::Ordering::Equal,
                }
            });

            for entry in sorted_entries {
                let employee = employee_map.get(&entry.employee_id);
                let shift = shift_map.get(&entry.shift_id);

                let employee_name = employee
                    .map(|e| format!("{} {}", e.first_name, e.last_name))
                    .unwrap_or_else(|| format!("ID {}", entry.employee_id));

                let shift_times = shift
                    .map(|s| format!("{} - {}", s.start_time, s.end_time))
                    .unwrap_or_else(|| format!("ID {}", entry.shift_id));

                let shift_label = shift
                    .map(|s| {
                        let days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
                        days.get(s.day_of_week as usize).unwrap_or(&"?")
                    })
                    .unwrap_or("?");

                html.push_str(&format!(
                    "            <tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>\n",
                    date, employee_name, shift_label, shift_times
                ));
            }
        }
    }

    html.push_str(
        r#"        </tbody>
    </table>
</body>
</html>"#,
    );

    Ok(html)
}
