mod dersler;
mod teacher;
use dersler::{add_ders, delete_ders, get_dersler, update_ders};
use rusqlite::{Connection, Result};

use teacher::{add_teacher, delete_teacher, get_teachers, update_teacher, upload_image};

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("studentmanagement.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS dersler (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS teachers (
              id               INTEGER PRIMARY KEY AUTOINCREMENT,
              first_name       TEXT NOT NULL,
              last_name        TEXT NOT NULL,
              profile_picture  TEXT,
              ders_id          INTEGER NOT NULL UNIQUE,
              FOREIGN KEY(ders_id) REFERENCES dersler(id) ON DELETE CASCADE
          )",
        [],
    )?;

    Ok(conn)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_dersler,
            add_teacher,
            add_ders,
            update_teacher,
            delete_teacher,
            upload_image,
            get_teachers,
            delete_ders,
            update_ders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
