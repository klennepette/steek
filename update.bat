@echo off
echo Steek bijwerken via Bitbucket...
git pull
if %errorlevel% neq 0 (
    echo Fout bij git pull. Controleer uw internetverbinding.
    pause
    exit /b 1
)
echo Afhankelijkheden installeren...
npm install
echo Applicatie bouwen...
npm run build
echo Klaar! Start Steek opnieuw.
pause
