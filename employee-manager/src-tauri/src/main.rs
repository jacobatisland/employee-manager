#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct Employee {
    id: u32,
    name: String,
    email: String,
    department: String,
    position: String,
    salary: u32,
    hire_date: String,
    ssn: Option<String>,
    phone: Option<String>,
    address: Option<String>,
    employee_id: Option<String>,
    status: Option<String>,
    manager: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PaginationParams {
    page: Option<u32>,
    limit: Option<u32>,
    search: Option<String>,
    department: Option<String>,
    status: Option<String>,
    #[serde(rename = "sortBy")]
    sort_by: Option<String>,
    #[serde(rename = "sortOrder")]
    sort_order: Option<String>,
    #[serde(rename = "minSalary")]
    min_salary: Option<u32>,
    #[serde(rename = "maxSalary")]
    max_salary: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Pagination {
    #[serde(rename = "currentPage")]
    current_page: u32,
    #[serde(rename = "totalPages")]
    total_pages: u32,
    #[serde(rename = "totalRecords")]
    total_records: u32,
    #[serde(rename = "pageSize")]
    page_size: u32,
    #[serde(rename = "hasNextPage")]
    has_next_page: bool,
    #[serde(rename = "hasPreviousPage")]
    has_previous_page: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct Filters {
    search: String,
    department: String,
    status: String,
    #[serde(rename = "sortBy")]
    sort_by: String,
    #[serde(rename = "sortOrder")]
    sort_order: String,
    #[serde(rename = "minSalary")]
    min_salary: String,
    #[serde(rename = "maxSalary")]
    max_salary: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct PaginatedResponse {
    employees: Vec<Employee>,
    pagination: Pagination,
    filters: Filters,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExternalConfig {
    server_url: Option<String>,
}

// Tauri commands for communicating with the server
#[tauri::command]
async fn fetch_employees_paginated(server_url: String, params: PaginationParams) -> Result<PaginatedResponse, String> {
    let mut url = format!("{}/api/employees", server_url);
    let mut query_params = Vec::new();
    
    if let Some(page) = params.page {
        query_params.push(format!("page={}", page));
    }
    if let Some(limit) = params.limit {
        query_params.push(format!("limit={}", limit));
    }
    if let Some(search) = params.search {
        if !search.is_empty() {
            query_params.push(format!("search={}", urlencoding::encode(&search)));
        }
    }
    if let Some(department) = params.department {
        if !department.is_empty() {
            query_params.push(format!("department={}", urlencoding::encode(&department)));
        }
    }
    if let Some(status) = params.status {
        if !status.is_empty() {
            query_params.push(format!("status={}", urlencoding::encode(&status)));
        }
    }
    if let Some(sort_by) = params.sort_by {
        if !sort_by.is_empty() {
            query_params.push(format!("sortBy={}", sort_by));
        }
    }
    if let Some(sort_order) = params.sort_order {
        if !sort_order.is_empty() {
            query_params.push(format!("sortOrder={}", sort_order));
        }
    }
    if let Some(min_salary) = params.min_salary {
        query_params.push(format!("minSalary={}", min_salary));
    }
    if let Some(max_salary) = params.max_salary {
        query_params.push(format!("maxSalary={}", max_salary));
    }
    
    if !query_params.is_empty() {
        url.push('?');
        url.push_str(&query_params.join("&"));
    }
    
    let response = tauri_plugin_http::reqwest::get(&url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let body = response.text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    let api_response: ApiResponse<PaginatedResponse> = serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    if api_response.success {
        Ok(api_response.data.unwrap())
    } else {
        Err(api_response.message.unwrap_or("Unknown error".to_string()))
    }
}

// Legacy method for backward compatibility
#[tauri::command]
async fn fetch_employees(server_url: String) -> Result<Vec<Employee>, String> {
    let params = PaginationParams {
        page: Some(1),
        limit: Some(10000), // Large limit to get all employees
        search: None,
        department: None,
        status: None,
        sort_by: Some("name".to_string()),
        sort_order: Some("ASC".to_string()),
        min_salary: None,
        max_salary: None,
    };
    
    match fetch_employees_paginated(server_url, params).await {
        Ok(response) => Ok(response.employees),
        Err(e) => Err(e),
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

#[tauri::command]
async fn read_external_config(app_handle: tauri::AppHandle) -> Result<Option<ExternalConfig>, String> {
    // Get the app data directory using Tauri 2.0 API
    let app_data_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Create the config file path
    let config_path = app_data_dir.join("config.json");
    
    // Check if the config file exists
    if !config_path.exists() {
        return Ok(None);
    }
    
    // Read the config file
    match std::fs::read_to_string(&config_path) {
        Ok(content) => {
            match serde_json::from_str::<ExternalConfig>(&content) {
                Ok(config) => Ok(Some(config)),
                Err(e) => Err(format!("Failed to parse config file: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to read config file: {}", e)),
    }
}

#[tauri::command]
async fn write_external_config(app_handle: tauri::AppHandle, server_url: String) -> Result<(), String> {
    // Get the app data directory using Tauri 2.0 API
    let app_data_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Create the config directory if it doesn't exist
    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    // Create the config file path
    let config_path = app_data_dir.join("config.json");
    
    // Create the config object
    let config = ExternalConfig {
        server_url: Some(server_url),
    };
    
    // Write the config file
    let config_json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    std::fs::write(&config_path, config_json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            fetch_employees,
            fetch_employees_paginated,
            create_employee,
            update_employee,
            delete_employee,
            read_external_config,
            write_external_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
