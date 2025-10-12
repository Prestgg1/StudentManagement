mod dersler;
mod teacher;
mod students;
use dersler::{add_ders, delete_ders, get_dersler, update_ders};
use rusqlite::{Connection, Result};
use students::{add_student,get_students,get_students_by_ders,search_student,update_student,
    delete_student,make_payment,get_student_payments};
use teacher::{add_teacher, delete_teacher, get_teachers, get_teachers_by_ders   , update_teacher, upload_image};


pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("studentmanagement.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS dersler (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            monthly_fee INTEGER NOT NULL
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


 // Students
 conn.execute(
    "CREATE TABLE IF NOT EXISTS students (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name  TEXT NOT NULL,
        last_name   TEXT NOT NULL
    )",
    [],
)?;

// Studentin kursları (bir telebe çox kursa yaza bilər)
conn.execute(
    "CREATE TABLE IF NOT EXISTS student_courses (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id  INTEGER NOT NULL,
        ders_id     INTEGER NOT NULL,
        start_date  TEXT NOT NULL,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(ders_id) REFERENCES dersler(id) ON DELETE CASCADE
    )",
    [],
)?;

// Ödənişlər (telebe ödədikcə buraya yazılır)
conn.execute(
    "CREATE TABLE IF NOT EXISTS payments (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id  INTEGER NOT NULL,
        amount      INTEGER NOT NULL,
        date        TEXT NOT NULL,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
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
            update_ders,
            get_teachers_by_ders,
            get_students,
            add_student,
            get_students_by_ders,
            update_student,
            make_payment,
            get_student_payments,
            delete_student,
            search_student,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
