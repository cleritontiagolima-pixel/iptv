#!/bin/bash

echo "Iniciando Sistema IPTV..."
echo ""

echo "[1/3] Iniciando Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "[2/3] Aguardando Backend iniciar..."
sleep 5

echo "[3/3] Iniciando Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Sistema iniciado!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar os serviços"
echo "Para iniciar o app mobile, execute: cd mobile && npm start"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
