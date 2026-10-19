@echo off
title TU DONG CAP NHAT LEN GITHUB - XU DOAN CARLO ACUTIS
color 0A

echo ===============================================================
echo   XU DOAN CARLO ACUTIS - GIAO HO VINH LOC
echo   DANG TU DONG DONG BO DU LIEU VA MA NGUON LEN GITHUB...
echo ===============================================================
echo.

cd /d "%~dp0"

echo [1/3] Dang them cac tep tin thay doi (git add)...
git add .

echo.
echo [2/3] Dang ghi nhan thay doi (git commit)...
git commit -m "auto: cap nhat tu dong %date% %time%"

echo.
echo [3/3] Dang day truc tiep len GitHub (git push origin main)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===============================================================
    echo   THANH CONG 100%! DA DAY LEN GITHUB HOAN TAT!
    echo   May chu Render se tu dong cap nhat trang web sau 1 - 2 phut.
    echo ===============================================================
) else (
    echo.
    echo ===============================================================
    echo   CO THAY DOI HOAC CHUA THE DAY LEN GITHUB!
    echo   Vui long kiem tra lai ket noi mang Internet.
    echo ===============================================================
)

echo.
echo Nhan phim bat ky de dong cua so nay...
pause >nul
