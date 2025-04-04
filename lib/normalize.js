const cleanToRawMap = {
    "Incline Dumbbell Bench Press": "incline db bench",
    "Incline Dumbbell Fly": "incline db fly",
    "Band Fly": "band fly",
    "Barbell Back Squat": "squat",
    "Sissy Squat": "sissy squat",
    "Romanian Deadlift": "rdl",
    "Lying Leg Curl": "leg curls",
    "Seated Dumbbell Overhead Press": "seated db ohp",
    "Close Grip Bench Press": "cg bench",
    "Band Overhead Extension": "band overhead ext",
    "Band Tricep Pushdown": "band tricep pushdown",
    "Dumbbell Bicep Curls": "db curls",
    "Band Bicep Curls": "band curls",
    "Band Rear Delt Raise": "band rear delt raise",
    "Dumbbell Side Lateral Raise": "db side delt raise",
    "Pull-Ups": "pullups",
    "Bent Over Barbell Row": "bent over barabell row",
    "One-Arm Dumbbell Row": "1 arm db row",
    "One-Arm Cable Row (High to Low)": "1 arm cable row - high to low",
    "Cable Pullover": "cable pullover",
    "Reverse Hyperextension": "reverse hyperextention",
    "Cable Crunch": "cable crunch",
    "Bench Leg Raise": "bench leg raise",
    "Dead Bug": "dead bug",
    "Seated Dumbbell Russian Twist": "seated dumbbell russian twist"
  };
  
  export function denormalizeExerciseName(cleanName) {
  console.log("🔧 [DEBUG] Loaded: ../lib/normalize.js");
    return cleanToRawMap[cleanName.trim()] || cleanName.trim();
  }
  