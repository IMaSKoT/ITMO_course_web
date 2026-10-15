$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (!(Test-Path .env)) {
    throw "Create .env from .env.example and fill in the passwords"
}

Get-Content .env | Where-Object { $_ -match '^\s*[^#\s].*=' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}

foreach ($name in 'DB_URL', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD') {
    if (![Environment]::GetEnvironmentVariable($name, 'Process')) {
        throw "Missing value in .env: $name"
    }
}

try {
    $api = Invoke-RestMethod http://localhost:8080/openapi -Headers @{ Accept = 'application/json' } -TimeoutSec 2
    if ($api.info.title -eq 'Dormitory API') {
        Write-Host 'Already running: http://localhost:8080/ (swagger: http://localhost:8080/swagger.html)'
        return
    }
} catch {}

$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (!$maven) {
    $maven = Join-Path $env:USERPROFILE 'Tools\apache-maven-3.9.16\bin\mvn.cmd'
    if (!(Test-Path $maven)) {
        throw 'Maven not found. Add its bin directory to PATH'
    }
}

& $maven package
if ($LASTEXITCODE -ne 0) {
    throw 'Build failed'
}

java "-Djdk.net.unixdomain.tmpdir=$env:TEMP\lab3-no-unix-sockets" -jar target/payara-micro.jar --deploy target/dormitory.war --contextroot ROOT --port 8080
