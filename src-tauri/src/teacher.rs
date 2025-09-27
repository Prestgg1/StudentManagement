use crate::init_db;
use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
pub fn upload_image(name: String, buffer: Vec<u8>) -> Result<String, String> {
    let images_dir = std::path::Path::new("images");
    if !images_dir.exists() {
        std::fs::create_dir_all(images_dir).map_err(|e| format!("Qovluq yaradılarkən xəta: {}", e))?;
    }

    let dest_path = images_dir.join(&name);
    std::fs::write(&dest_path, &buffer).map_err(|e| format!("Fayl yazılarkən xəta: {}", e))?;

    let mime_type = if name.to_lowercase().ends_with(".png") {
        "image/png"
    } else if name.to_lowercase().ends_with(".jpg") || name.to_lowercase().ends_with(".jpeg") {
        "image/jpeg"
    } else if name.to_lowercase().ends_with(".gif") {
        "image/gif"
    } else {
        "image/jpeg" 
    };
    let base64_encoded = general_purpose::STANDARD.encode(&buffer);

    Ok(format!("data:{};base64,{}", mime_type, base64_encoded))
}

#[derive(Serialize, Deserialize)]
pub struct Teacher {
    id: i32,
    first_name: String,
    last_name: String,
    profile_picture: Option<String>,
    ders_id: i32,
}

#[tauri::command]
pub fn add_teacher(
    firstname: String,
    lastname: String,
    profilepicture: Option<String>,
    dersid: i32,
) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO teachers (first_name, last_name, profile_picture, ders_id) VALUES (?1, ?2, ?3, ?4)",
        params![firstname, lastname, profilepicture, dersid],
    ).map_err(|e| e.to_string())?;

    Ok(format!("Müəllim {} {} əlavə olundu", firstname, lastname))
}

#[tauri::command]
pub fn get_teachers() -> Result<Vec<Teacher>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, first_name, last_name, profile_picture, ders_id FROM teachers")
        .map_err(|e| e.to_string())?;

    let teacher_iter = stmt
        .query_map([], |row| {
            Ok(Teacher {
                id: row.get(0)?,
                first_name: row.get(1)?,
                last_name: row.get(2)?,
                profile_picture: row.get(3)?,
                ders_id: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut teachers = Vec::new();
    for teacher in teacher_iter {
        teachers.push(teacher.map_err(|e| e.to_string())?);
    }

    Ok(teachers)
}

#[tauri::command]
pub fn update_teacher(
    id: i32,
    firstname: String,
    lastname: String,
    profilepicture: Option<String>,
    dersid: i32,
) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let rows = conn.execute(
        "UPDATE teachers SET first_name = ?1, last_name = ?2, profile_picture = ?3, ders_id = ?4 WHERE id = ?5",
        params![firstname, lastname, profilepicture, dersid, id],
    ).map_err(|e| e.to_string())?;

    if rows > 0 {
        Ok(format!("Müəllim ID {} güncəlləndi", id))
    } else {
        Err(format!("Müəllim ID {} tapılmadı", id))
    }
}

#[tauri::command]
pub fn delete_teacher(id: i32) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let rows = conn
        .execute("DELETE FROM teachers WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    if rows > 0 {
        Ok(format!("Müəllim ID {} silindi", id))
    } else {
        Err(format!("Müəllim ID {} tapılmadı", id))
    }
}
