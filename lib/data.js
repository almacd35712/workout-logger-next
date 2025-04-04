console.log("🔧 [DEBUG] Loaded: ../lib/data.js");
// lib/data.js

export const days = [
    "Day 1",
    "Day 2",
    "Day 3",
    "Day 4",
    "Warm Up",
    "Abs (Any Day)"
  ];
  
  export const exercises = {
    "Day 1": ["Incline DB Press", "Flat DB Press", "Triceps Extension"],
    "Day 2": ["Squat", "Lunges", "Hamstring Curl"],
    "Day 3": ["Pull-ups", "Barbell Row", "Bicep Curl"],
    "Day 4": ["Shoulder Press", "Lateral Raise", "Rear Delt Fly"],
    "Warm Up": ["Stationary Bike", "Band Pull-Aparts"],
    "Abs (Any Day)": ["Plank", "Hanging Leg Raises", "Cable Crunch"]
  };
  
  export const logs = []; // In-memory log store (temporary, resets on reload)
  