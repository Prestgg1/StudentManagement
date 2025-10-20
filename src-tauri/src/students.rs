use crate::{dersler::Ders, init_db};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use chrono::{Datelike, NaiveDate, Utc};

#[derive(Serialize, Deserialize, Debug)]
pub struct Student {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub dersler: Vec<Ders>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StudentCourse {
    pub id: i32,
    pub student_id: i32,
    pub ders_id: i32,
    pub start_date: String,
}

#[derive(Serialize, Deserialize, Debug,Clone)]
pub struct Payment {
    pub id: i32,
    pub student_id: i32,
    pub amount: i32,
    pub date: String,
    pub paid: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StudentResponse {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub dersler: Vec<Ders>,
    pub debt: i32,
}



//
// 🟩 STUDENT ƏMƏLİYYATLARI
//

#[tauri::command]
pub fn add_student(firstname: String, lastname: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO students (first_name, last_name) VALUES (?1, ?2)",
        params![firstname, lastname],
    )
    .map_err(|e| e.to_string())?;
    Ok(format!("Tələbə {} {} əlavə olundu ✅", firstname, lastname))
}

#[tauri::command]
pub fn update_student(studentid: i32, firstname: String, lastname: String, dersler: Vec<Ders>) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    // Tələbənin olub-olmamasını yoxlayırıq
    let exists: Result<i32, _> = conn.query_row(
        "SELECT id FROM students WHERE id = ?1",
        params![studentid],
        |row| row.get(0),
    );

    if exists.is_err() {
        return Err(format!("Tələbə ID {} tapılmadı ❌", studentid));
    }

    // Ad və soyadı yenilə
    conn.execute(
        "UPDATE students SET first_name = ?1, last_name = ?2 WHERE id = ?3",
        params![firstname, lastname, studentid],
    )
    .map_err(|e| e.to_string())?;

    // Mövcud dərsləri çək
    let mut stmt = conn
        .prepare("SELECT ders_id FROM student_courses WHERE student_id = ?1")
        .map_err(|e| e.to_string())?;
    let current_dersler: Vec<i32> = stmt
        .query_map(params![studentid], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    // Yeni dərsləri əlavə et
    for ders in &dersler {
        if !current_dersler.contains(&ders.id) {
            conn.execute(
                "INSERT INTO student_courses (student_id, ders_id, start_date) VALUES (?1, ?2, ?3)",
                params![studentid, ders.id, Utc::now().naive_utc().date().to_string()],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    // Artıq olmayan dərsləri sil
    for ders_id in current_dersler {
        if !dersler.iter().any(|d| d.id == ders_id) {
            conn.execute(
                "DELETE FROM student_courses WHERE student_id = ?1 AND ders_id = ?2",
                params![studentid, ders_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(format!("Tələbə ID {} yeniləndi ✅", studentid))
}

#[tauri::command]
pub fn delete_student(studentid: i32) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM student_courses WHERE student_id = ?1", params![studentid])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM students WHERE id = ?1", params![studentid])
        .map_err(|e| e.to_string())?;
    Ok(format!("Tələbə ID {} silindi 🗑️", studentid))
}

#[tauri::command]
pub fn get_students() -> Result<Vec<StudentResponse>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.first_name, s.last_name, 
                COALESCE(GROUP_CONCAT(d.name, ','), '') as dersler
             FROM students s
             LEFT JOIN student_courses sc ON s.id = sc.student_id
             LEFT JOIN dersler d ON sc.ders_id = d.id
             GROUP BY s.id, s.first_name, s.last_name",
        )
        .map_err(|e| e.to_string())?;

    let student_iter = stmt.query_map([], |row| {
        let ders_str: String = row.get(3)?;
        let ders_list = ders_str
            .split(',')
            .filter(|s| !s.is_empty())
            .map(|name| Ders { id: 0, name: name.to_string(), monthlyfee: 0 })
            .collect();
        let debt: Result<i32, String> = get_student_balance(row.get(0)?);
        Ok(StudentResponse {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            dersler: ders_list,
            debt: debt.unwrap_or(0),
        })
    }).map_err(|e| e.to_string())?;

    let mut students = Vec::new();
    for s in student_iter {
        students.push(s.map_err(|e| e.to_string())?);
    }
    Ok(students)
}

#[tauri::command]
pub fn get_students_by_ders(dersid: i32) -> Result<Vec<StudentResponse>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT 
            s.id, s.first_name, s.last_name, 
            COALESCE(GROUP_CONCAT(d.name, ','), '') as dersler
         FROM students s
         INNER JOIN student_courses sc ON s.id = sc.student_id
         LEFT JOIN dersler d ON sc.ders_id = d.id
         WHERE sc.ders_id = ?1
         GROUP BY s.id, s.first_name, s.last_name"
    ).map_err(|e| e.to_string())?;

    let student_iter = stmt.query_map(params![dersid], |row| {
        let ders_str: String = row.get(3)?;
        let ders_list = ders_str
            .split(',')
            .filter(|s| !s.is_empty())
            .map(|name| Ders { id: 0, name: name.to_string(), monthlyfee: 0 })
            .collect();
        let debt: Result<i32, String> = get_student_balance(row.get(0)?);

        Ok(StudentResponse {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            dersler: ders_list,
            debt: debt.unwrap_or(0),
        })
    }).map_err(|e| e.to_string())?;

    let mut students = Vec::new();
    for s in student_iter {
        students.push(s.map_err(|e| e.to_string())?);
    }
    Ok(students)
}
#[tauri::command]
pub fn search_student(search: String) -> Result<Vec<Student>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, first_name, last_name FROM students 
         WHERE first_name LIKE ?1 OR last_name LIKE ?2"
    ).map_err(|e| e.to_string())?;

    let student_iter = stmt.query_map(
        params![format!("%{}%", search), format!("%{}%", search)],
        |row| Ok(Student {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            dersler: vec![],
        }),
    ).map_err(|e| e.to_string())?;

    let mut students = Vec::new();
    for s in student_iter {
        students.push(s.map_err(|e| e.to_string())?);
    }
    Ok(students)
}

//
// 🟩 BALANS və ÖDƏNİŞLƏR
//

#[tauri::command]
pub fn get_student_balance(student_id: i32) -> Result<i32, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT d.monthly_fee, sc.start_date
         FROM student_courses sc
         JOIN dersler d ON sc.ders_id = d.id
         WHERE sc.student_id = ?1"
    ).map_err(|e| e.to_string())?;

    let today = Utc::now().naive_utc().date();
    let mut total_due = 0;

    let course_iter = stmt.query_map(params![student_id], |row| {
        let fee: i32 = row.get(0)?;
        let start_date: String = row.get(1)?;
        Ok((fee, start_date))
    }).map_err(|e| e.to_string())?;

    for course in course_iter {
        let (fee, start_date) = course.map_err(|e| e.to_string())?;
        let start = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
            .map_err(|e| e.to_string())?;
        let months = (today.year() - start.year()) * 12 + (today.month() as i32 - start.month() as i32);
        let months_passed = if months < 0 { 0 } else { months + 1 };
        total_due += fee * months_passed;
    }

    // Ödənilən məbləğ
    let mut stmt2 = conn.prepare("SELECT COALESCE(SUM(amount),0) FROM payments WHERE student_id = ?1")
        .map_err(|e| e.to_string())?;
    let total_paid: i32 = stmt2.query_row(params![student_id], |row| row.get(0)).unwrap_or(0);

    Ok(total_due - total_paid)
}


#[tauri::command]
pub fn get_student_payments(studentid: i32) -> Result<Vec<Payment>, String> {
    use chrono::{Datelike, NaiveDate};
    use rusqlite::params;

    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT p.id, p.amount, p.date
         FROM payments p
         WHERE p.student_id = ?1"
    ).map_err(|e| e.to_string())?;

    let payment_iter = stmt.query_map(params![studentid], |row| {
        Ok(Payment {
            id: row.get(0)?,
            student_id: studentid,
            amount: row.get(1)?,
            date: row.get::<_, String>(2)?,
            paid: true, // Yeni sahə əlavə edirik
        })
    }).map_err(|e| e.to_string())?;

    let mut payments: Vec<Payment> = Vec::new();
    for p in payment_iter {
        payments.push(p.map_err(|e| e.to_string())?);
    }

    // Əgər heç ödəniş yoxdursa, belə olsa da, ən azı bu ilin əvvəlindən bu günə qədər bütün ayları göstər.
    let today = chrono::Local::today().naive_local();
    let start = if let Some(first_payment) = payments.first() {
        NaiveDate::parse_from_str(&first_payment.date, "%Y-%m-%d")
            .unwrap_or_else(|_| NaiveDate::from_ymd_opt(today.year(), 1, 1).unwrap())
    } else {
        // Əgər heç ödəniş yoxdursa, başlanğıc olaraq bu ilin yanvar ayı götürülür
        NaiveDate::from_ymd_opt(today.year(), 1, 1).unwrap()
    };

    let mut month_cursor = NaiveDate::from_ymd_opt(start.year(), start.month(), 1).unwrap();
    let mut complete_payments: Vec<Payment> = Vec::new();

    while month_cursor <= today {
        // Bu ay üçün ödəniş varmı?
        let mut found_payment: Option<Payment> = None;
        for p in payments.iter() {
            let p_date = NaiveDate::parse_from_str(&p.date, "%Y-%m-%d")
                .unwrap_or_else(|_| today);
            if p_date.year() == month_cursor.year() && p_date.month() == month_cursor.month() {
                found_payment = Some(p.clone());
                break;
            }
        }

        match found_payment {
            Some(mut p) => {
                p.paid = true;
                complete_payments.push(p);
            }
            None => {
                complete_payments.push(Payment {
                    id: 0,
                    student_id: studentid,
                    amount: 0,
                    date: month_cursor.format("%Y-%m-%d").to_string(),
                    paid: false, // Ödəniş yoxdur
                });
            }
        }

        // Sonrakı aya keçirik
        month_cursor = next_month_from_date(month_cursor);
    }

    Ok(complete_payments)
}

fn next_month_from_date(current_date: NaiveDate) -> NaiveDate {
    if current_date.month() == 12 {
        NaiveDate::from_ymd_opt(current_date.year() + 1, 1, 1).unwrap()
    } else {
        NaiveDate::from_ymd_opt(current_date.year(), current_date.month() + 1, 1).unwrap()
    }
}


#[tauri::command]
pub fn make_payment(studentid: i32, amount: i32, date: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO payments (student_id, amount, date) VALUES (?1, ?2, ?3)",
        params![studentid, amount, date],
    ).map_err(|e| e.to_string())?;
    Ok(format!("Tələbə ID {} üçün {} AZN ödəniş əlavə olundu ✅", studentid, amount))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PaymentWithStudent {
    pub id: i32,
    pub student_id: i32,
    pub student_name: String,
    pub amount: i32,
    pub date: String,
}

#[tauri::command]
pub fn get_all_payments() -> Result<Vec<PaymentWithStudent>, String> {
    let conn: Connection = init_db().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "
        SELECT 
            p.id,
            p.student_id,
            s.first_name || ' ' || s.last_name AS student_name,
            p.amount,
            p.date
        FROM payments p
        INNER JOIN students s ON p.student_id = s.id
        ORDER BY p.date DESC
        "
    ).map_err(|e| e.to_string())?;

    let payment_iter = stmt.query_map([], |row| {
        Ok(PaymentWithStudent {
            id: row.get(0)?,
            student_id: row.get(1)?,
            student_name: row.get(2)?,
            amount: row.get(3)?,
            date: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut payments: Vec<PaymentWithStudent> = Vec::new();
    for p in payment_iter {
        payments.push(p.map_err(|e| e.to_string())?);
    }

    Ok(payments)
}
