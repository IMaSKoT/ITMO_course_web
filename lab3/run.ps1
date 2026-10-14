# запуск на Windows (PowerShell): .\run.ps1
# читает переменные из .env и запускает сервер Payara Micro с нашим приложением
Get-Content .env | Where-Object { $_ -match '^\s*[^#\s].*=' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}
java -jar target/payara-micro.jar --deploy target/dormitory.war --contextroot ROOT --port 8080
