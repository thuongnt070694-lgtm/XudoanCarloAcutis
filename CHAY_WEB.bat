@echo off
title KHOI CHAY HE THONG - XU DOAN CARLO ACUTIS
color 0B

cd /d "%~dp0"

echo ===============================================================
echo   DANG KHOI CHAY: XU DOAN CARLO ACUTIS - GIAO HO VINH LOC
echo   Trinh duyet se tu dong mo trang web: http://localhost:3000
echo ===============================================================
echo.

start http://localhost:3000
npm run dev
pause
