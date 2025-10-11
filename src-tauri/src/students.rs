use crate::init_db;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use chrono::{Datelike, NaiveDate, Utc}; // ✅ Datelike trait daxil edilməlidir

#[derive(Serialize, Deserialize)]
pub struct Student {
    id: i32,
    first_name: String,
    last_name: String,
}

#[derive(Serialize, Deserialize)]
pub struct StudentCourse {
    id: i32,
    student_id: i32,
    ders_id: i32,
    start_date: String,
}

#[derive(Serialize, Deserialize)]
pub struct Payment {
    id: i32,
    student_id: i32,
    amount: i32,
    date: String,
}
#[tauri::command]
pub fn add_student(firstname: String, lastname: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO students (first_name, last_name) VALUES (?1, ?2)",
        params![firstname, lastname],
    ).map_err(|e| e.to_string())?;

    Ok(format!("Telebe {} {} əlavə olundu", firstname, lastname))
}
#[tauri::command]
pub fn enroll_student(studentid: i32, dersid: i32, startdate: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO student_courses (student_id, ders_id, start_date) VALUES (?1, ?2, ?3)",
        params![studentid, dersid, startdate],
    ).map_err(|e| e.to_string())?;

    Ok(format!("Telebe ID {} dərs ID {}-ə yazıldı", studentid, dersid))
}

#[tauri::command]
pub fn get_students() -> Result<Vec<Student>, String> {
    let conn: rusqlite::Connection = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, first_name, last_name FROM students").map_err(|e| e.to_string())?;
    let student_iter = stmt.query_map([], |row| {
        Ok(Student {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;
    let mut students = Vec::new();
    for student in student_iter {
        students.push(student.map_err(|e| e.to_string())?);
    }
    Ok(students)
}


#[tauri::command]
pub fn get_students_by_ders(dersid: i32) -> Result<Vec<Student>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT s.id, s.first_name, s.last_name
            FROM students s
            INNER JOIN student_courses sc ON s.id = sc.student_id
            WHERE sc.ders_id = ?
            ",
        )
        .map_err(|e| e.to_string())?;

    let student_iter = stmt
        .query_map(params![dersid], |row| {
            Ok(Student {
                id: row.get(0)?,
                first_name: row.get(1)?,
                last_name: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut students = Vec::new();
    for student in student_iter {
        students.push(student.map_err(|e| e.to_string())?);
    }

    Ok(students)
}



#[tauri::command]
pub fn get_student_balance(student_id: i32) -> Result<i32, String> {
    let conn: rusqlite::Connection = init_db().map_err(|e| e.to_string())?;

    // Tələbənin bütün kurslarını çəkirik
    let mut stmt = conn.prepare(
        "SELECT d.monthly_fee, sc.start_date
         FROM student_courses sc
         JOIN dersler d ON sc.ders_id = d.id
         WHERE sc.student_id = ?1"
    ).map_err(|e| e.to_string())?;

    let mut total_due = 0;
    let today = chrono::Utc::now().naive_utc().date();

    let course_iter = stmt.query_map(params![student_id], |row| {
        let fee: i32 = row.get(0)?;
        let start_date: String = row.get(1)?;
        Ok((fee, start_date))
    }).map_err(|e| e.to_string())?;

    for course in course_iter {
        let (fee, start_date) = course.map_err(|e| e.to_string())?;
        let start = chrono::NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
            .map_err(|e| e.to_string())?;

        let months_passed = (today.year() - start.year()) * 12 + (today.month() as i32 - start.month() as i32);
        let months_passed = if months_passed < 0 { 0 } else { months_passed + 1 }; // qeydiyyat ayı da daxildir

        total_due += fee * months_passed;
    }

    let mut stmt2 = conn.prepare(
        "SELECT COALESCE(SUM(amount),0) FROM payments WHERE student_id = ?1"
    ).map_err(|e| e.to_string())?;
    let total_paid: i32 = stmt2.query_row(params![student_id], |row| row.get(0))
        .unwrap_or(0);

    Ok(total_due - total_paid)
}







#[tauri::command]
pub fn make_payment(student_id: i32, amount: i32, date: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO payments (student_id, amount, date) VALUES (?1, ?2, ?3)",
        params![student_id, amount, date],
    ).map_err(|e| e.to_string())?;

    Ok(format!("Telebe ID {} üçün {} AZN ödəniş qeydə alındı", student_id, amount))
}





