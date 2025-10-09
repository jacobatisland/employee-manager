# External Configuration

The Employee Management System supports external configuration files that allow you to change the server URL without opening the application.

## Configuration File Locations

### macOS
```
~/Library/Application Support/com.employeemanager/config.json
```

### Windows
```
%APPDATA%\com.employeemanager\config.json
```

## Configuration File Format

Create a JSON file with the following structure:

```json
{
  "serverUrl": "your-server-url:port"
}
```

## Example Configuration

```json
{
  "serverUrl": "employee-db.se-island.life:4001"
}
```

## How to Use

1. **Create the directory** (if it doesn't exist):
   - **macOS**: `mkdir -p ~/Library/Application\ Support/com.employeemanager/`
   - **Windows**: `mkdir %APPDATA%\com.employeemanager\`

2. **Copy the config file**:
   - Copy `config.json` from the app directory to the appropriate location
   - Edit the `serverUrl` value to your desired server

3. **Restart the application**:
   - The app will automatically detect and use the external configuration
   - Settings changed via the external config file will override the app's internal settings

## Notes

- The external config file takes precedence over the app's internal settings
- If the external config file is not found, the app will use its default settings
- Changes to the external config file require restarting the application
- The external config file only affects the `serverUrl` setting

## Troubleshooting

- Ensure the JSON file is valid (use a JSON validator if needed)
- Check file permissions - the app needs read access to the config file
- Verify the directory path is correct for your operating system
- Make sure there are no extra spaces or characters in the file path
