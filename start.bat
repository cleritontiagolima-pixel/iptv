@echo off
echo Iniciando Sistema IPTV...
echo.

echo [1/3] Iniciando Backend...
cd backend
start cmd /k "npm run dev"
cd ..

echo [2/3] Aguardando Backend iniciar...
timeout /t 5 /nobreak > nul

echo [3/3] Iniciando Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo Sistema iniciado!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para iniciar o aplicativo mobile (opcional)...
pause > nul

echo.
echo Iniciando aplicativo mobile...
cd mobile
npm start
