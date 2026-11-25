$ErrorActionPreference = 'Stop'
Set-Location "$PSScriptRoot\pixelbyte-api"
if (-not $env:DB_PASSWORD) {
    $secure = Read-Host 'Contraseña MySQL' -AsSecureString
    $env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
}
if (-not $env:DEMO_PASSWORD) {
    $secure = Read-Host 'Clave para crear cuentas DEMO (6 a 10 caracteres; usa una clave de prueba)' -AsSecureString
    $env:DEMO_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
}
if (-not $env:GOOGLE_CLIENT_ID) {
    $env:GOOGLE_CLIENT_ID = Read-Host 'Google OAuth Client ID (Enter para habilitarlo después)'
}
.\mvnw.cmd spring-boot:run
