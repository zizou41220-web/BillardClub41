@echo off
echo Installation du logo Billard Club 41...
copy "C:\Users\tessiers\OneDrive - ALL Circuits\Images\Pellicule\LogoBillard41.jpg" "%~dp0logo.png"
if %errorlevel% equ 0 (
    echo [SUCCES] Le logo a ete installe avec succes !
) else (
    echo [ERREUR] Impossible de trouver le fichier source. Verifiez que le chemin est correct.
)
pause
