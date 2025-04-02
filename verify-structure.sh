#!/bin/bash

echo "🔍 Verifying workout-logger-next file structure..."

expected_dirs=(
  "lib/parsers"
  "lib/utils"
  "lib/sheets"
)

expected_files=(
  "lib/parsers/findDayBlock.js"
  "lib/parsers/findExerciseRow.js"
  "lib/parsers/getActualSets.js"
  "lib/utils/normalize.js"
  "lib/utils/isWarmupSet.js"
  "lib/sheets/getSheetData.js"
)

all_ok=true

# Check for directories
for dir in "${expected_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ Folder exists: $dir"
  else
    echo "❌ Missing folder: $dir"
    all_ok=false
  fi
done

# Check for files
for file in "${expected_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ File exists: $file"
  else
    echo "❌ Missing file: $file"
    all_ok=false
  fi
done

if $all_ok; then
  echo -e "\n🎉 All required files and folders are in place!"
else
  echo -e "\n⚠️ Some required files or folders are missing. Please re-run setup or fix manually."
fi
