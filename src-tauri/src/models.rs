use serde::{Deserialize, Serialize};

/// Pracownik (Employee)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    pub id: Option<i64>,
    pub first_name: String,
    pub last_name: String,
    pub role: Option<String>,
    pub employment_type: String,
    pub status: String,
}

/// Zmiana (Shift)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shift {
    pub id: Option<i64>,
    pub day_of_week: i32, // 0=Niedziela, 1=Poniedziałek, ..., 6=Sobota
    pub start_time: String, // Format: HH:MM
    pub end_time: String,   // Format: HH:MM
    pub required_staff: i32,
}

/// Nieobecność (Absence)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Absence {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub start_date: String, // Format: YYYY-MM-DD
    pub end_date: String,   // Format: YYYY-MM-DD
    #[serde(rename = "type")]
    pub absence_type: String, // 'urlop', 'zwolnienie', etc.
}

/// Wpis w grafiku (Schedule Entry)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleEntry {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub date: String, // Format: YYYY-MM-DD
    pub shift_id: i64,
}
