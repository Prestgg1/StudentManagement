use crate::init_db;
use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Ders {
    id: i32,
    name: String,
}
// Dersleri listeleme komutu
#[tauri::command]
pub fn get_dersler() -> Result<Vec<Ders>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name FROM dersler")
        .map_err(|e| e.to_string())?;
    let ders_iter = stmt
        .query_map([], |row| {
            Ok(Ders {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut dersler = Vec::new();
    for ders in ders_iter {
        dersler.push(ders.map_err(|e| e.to_string())?);
    }

    Ok(dersler)
}

#[tauri::command]
pub fn add_ders(name: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO dersler (name) VALUES (?1)", params![name])
        .map_err(|e| e.to_string())?;
    Ok(format!("Ders '{}' eklendi", name))
}

#[tauri::command]
pub fn delete_ders(id: i32) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let rows = conn
        .execute("DELETE FROM dersler WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    if rows > 0 {
        Ok(format!("Ders ID {} silindi", id))
    } else {
        Err(format!("Ders ID {} bulunamadı", id))
    }
}

// Ders düzenleme komutu
#[tauri::command]
pub fn update_ders(id: i32, new_name: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let rows = conn
        .execute(
            "UPDATE dersler SET name = ?1 WHERE id = ?2",
            params![new_name, id],
        )
        .map_err(|e| e.to_string())?;

    if rows > 0 {
        Ok(format!("Ders ID {} güncellendi", id))
    } else {
        Err(format!("Ders ID {} bulunamadı", id))
    }
}
