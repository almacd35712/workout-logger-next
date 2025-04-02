@echo off
set ZIP_PATH=C:\Users\alexm\Documents\workout-logger-next\workout_logger_package.zip
set CHAT_LOG_DIR=C:\Users\alexm\Documents\workout-logger-next\Workout Logger Chat History

echo Creating project zip...
powershell -command "Compress-Archive -Path 'C:\Users\alexm\Documents\workout-logger-next\*' -DestinationPath '%ZIP_PATH%' -Force"

for %%f in ("%CHAT_LOG_DIR%\*.txt") do set "latest=%%~tf" & set "file=%%f"
echo Latest chat log: %file%

echo Opening ChatGPT...
start https://chatgpt.com/g/g-p-67e1c150d9288191970245276c8e00c6-workout-logger/project

echo Prompt copied to clipboard.
echo Use the following:
echo "Here’s my workout logger code and latest chat log. The project zip is attached. Continue where we left off."

pause