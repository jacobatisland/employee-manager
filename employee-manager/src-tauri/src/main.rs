#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Employee {
    id: u32,
    name: String,
    email: String,
    department: String,
    position: String,
    salary: u32,
    hire_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    message: Option<String>,
}

// Tauri commands for communicating with the server
#[tauri::command]
async fn fetch_employees(server_url: String) -> Result<Vec<Employee>, String> {
    let url = format!("{}/api/employees", server_url);
    
    let response = tauri_plugin_http::reqwest::get(&url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let body = response.text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    let api_response: ApiResponse<Vec<Employee>> = serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    if api_response.success {
        Ok(api_response.data.unwrap_or_default())
    } else {
        Err(api_response.message.unwrap_or("Unknown error".to_string()))
    }
}

#[tauri::command]
async fn create_employee(server_url: String, employee: Employee) -> Result<Employee, String> {
    let url = format!("{}/api/employees", server_url);
    let client = tauri_plugin_http::reqwest::Client::new();
    
    let json_body = serde_json::to_string(&employee)
        .map_err(|e| format!("Failed to serialize employee: {}", e))?;
    
    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .body(json_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let body = response.text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    let api_response: ApiResponse<Employee> = serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    if api_response.success {
        Ok(api_response.data.unwrap())
    } else {
        Err(api_response.message.unwrap_or("Unknown error".to_string()))
    }
}

#[tauri::command]
async fn update_employee(server_url: String, id: u32, employee: Employee) -> Result<Employee, String> {
    let url = format!("{}/api/employees/{}", server_url, id);
    let client = tauri_plugin_http::reqwest::Client::new();
    
    let json_body = serde_json::to_string(&employee)
        .map_err(|e| format!("Failed to serialize employee: {}", e))?;
    
    let response = client
        .put(&url)
        .header("Content-Type", "application/json")
        .body(json_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let body = response.text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    let api_response: ApiResponse<Employee> = serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    if api_response.success {
        Ok(api_response.data.unwrap())
    } else {
        Err(api_response.message.unwrap_or("Unknown error".to_string()))
    }
}

#[tauri::command]
async fn delete_employee(server_url: String, id: u32) -> Result<bool, String> {
    let url = format!("{}/api/employees/{}", server_url, id);
    let client = tauri_plugin_http::reqwest::Client::new();
    
    let response = client
        .delete(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Check HTTP status first
    if !response.status().is_success() {
        return Err(format!("Server returned error: {}", response.status()));
    }
    
    let body = response.text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    // Try to parse as ApiResponse, but handle different response formats
    match serde_json::from_str::<ApiResponse<serde_json::Value>>(&body) {
        Ok(api_response) => Ok(api_response.success),
        Err(_) => {
            // If parsing fails, assume success if we got a 200 status
            println!("Could not parse response as ApiResponse, but got success status");
            Ok(true)
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            fetch_employees,
            create_employee,
            update_employee,
            delete_employee
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
