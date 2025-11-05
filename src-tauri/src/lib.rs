use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

pub mod commands;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      SqlBuilder::default()
        .add_migrations(
          "sqlite:grafik.db",
          vec![Migration {
            version: 1,
            description: "initial_schema",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
          }],
        )
        .build(),
    )
    .invoke_handler(tauri::generate_handler![
      commands::get_employees,
      commands::add_employee,
      commands::update_employee,
      commands::get_shifts,
      commands::update_shifts,
      commands::run_local_solver,
      commands::run_gemini_solver,
      commands::export_schedule_csv,
      commands::export_schedule_pdf_html,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
