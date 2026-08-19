@echo off
setlocal enabledelayedexpansion

title Toyota HR Portal Baslatici
color 0A

echo =======================================================
echo         Toyota HR Portal Otomatik Baslatiliyor
echo =======================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

:: Gerekirse bu portlari kendi projenize gore degistirin
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3000"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"

if not exist "%BACKEND_DIR%" (
    echo Hata: backend klasoru bulunamadi: %BACKEND_DIR%
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo Hata: frontend klasoru bulunamadi: %FRONTEND_DIR%
    echo.
    pause
    exit /b 1
)

:: Maven wrapper varsa onu kullan, yoksa sistemdeki mvn'i kullan
set "MVN_CMD=mvn"
if exist "%BACKEND_DIR%\mvnw.cmd" set "MVN_CMD=mvnw.cmd"

:: Backend portu (8080) zaten doluysa, o eski process'i temizle
echo [0/4] Port %BACKEND_PORT% kontrol ediliyor...
set "OLD_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:"LISTENING" ^| findstr /R /C:":%BACKEND_PORT% "') do set "OLD_PID=%%P"
if defined OLD_PID (
    echo     Uyari: Port %BACKEND_PORT% zaten PID !OLD_PID! tarafindan kullaniliyor.
    choice /M "    Bu process kapatilip devam edilsin mi"
    if errorlevel 2 (
        echo     Iptal edildi. Lutfen portu manuel olarak bosaltip tekrar calistirin.
        pause
        exit /b 1
    ) else (
        taskkill /PID !OLD_PID! /F >nul 2>&1
        echo     PID !OLD_PID! kapatildi.
        timeout /t 2 >nul
    )
)
echo.

echo [1/4] Backend servisi baslatiliyor (%MVN_CMD% spring-boot:run)...
start "Backend Servisi" cmd /k "cd /d ""%BACKEND_DIR%"" && %MVN_CMD% spring-boot:run"

echo [2/4] Backend'in ayaga kalkmasi bekleniyor (port %BACKEND_PORT%)...
:WAIT_BACKEND
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('localhost', %BACKEND_PORT%); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    timeout /t 2 >nul
    goto WAIT_BACKEND
)
echo     Backend hazir!
echo.

echo [3/4] Frontend servisi baslatiliyor...
if exist "%FRONTEND_DIR%\package.json" (
    findstr /I "\"dev\"" "%FRONTEND_DIR%\package.json" >nul
    if not errorlevel 1 (
        set "FRONTEND_CMD=npm run dev"
    ) else (
        set "FRONTEND_CMD=npm start"
    )
    if not exist "%FRONTEND_DIR%\node_modules" (
        echo     node_modules bulunamadi, once "npm install" calistiriliyor...
        pushd "%FRONTEND_DIR%"
        call npm install
        popd
        echo     npm install tamamlandi.
    )
    start "Frontend Servisi" cmd /k "cd /d ""%FRONTEND_DIR%"" && !FRONTEND_CMD!"
) else (
    echo Hata: frontend klasorunde package.json bulunamadi.
    echo Lutfen frontend dizinini kontrol edin.
    echo.
    pause
    exit /b 1
)

echo [4/4] Frontend'in ayaga kalkmasi bekleniyor (port %FRONTEND_PORT%)...
:WAIT_FRONTEND
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('localhost', %FRONTEND_PORT%); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    timeout /t 2 >nul
    goto WAIT_FRONTEND
)
echo     Frontend hazir!
echo.

echo Tarayici aciliyor: %FRONTEND_URL%
start "" "%FRONTEND_URL%"

echo.
echo =======================================================
echo   Islem tamamlandi! Uygulama tarayicida acildi.
echo   Backend ve frontend, acik kalan iki ayri pencerede
echo   calismaya devam ediyor. Durdurmak icin o pencereleri
echo   kapatmaniz yeterli.
echo =======================================================
echo.
pause
exit /b 0
