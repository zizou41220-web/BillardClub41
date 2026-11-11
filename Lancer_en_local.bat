@echo off
chcp 65001 > nul
title Portail Unifié Billard Club 41 - Serveur Local
echo ======================================================================
echo   PORTAIL UNIFIÉ BILLARD CLUB 41 - TEST EN LOCAL
echo ======================================================================
echo.
echo Lancement du serveur local HTTP...
echo Votre navigateur va s'ouvrir automatiquement sur http://localhost:5000/
echo.
echo (Laissez cette fenetre ouverte pendant toute la duree de votre test)
echo (Pour arreter le serveur, fermez simplement cette fenetre)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause

