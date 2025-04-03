'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [dayOptions, setDayOptions] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [setCount, setSetCount] = useState(0);
  const [lastActual, setLastActual] = useState("");
  const [prescribed, setPrescribed] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [suggestedWeight, setSuggestedWeight] = useState(null);
  const [warmupSets, setWarmupSets] = useState([]);
  const [showSuggested, setShowSuggested] = useState(false);
  const [showWarmups, setShowWarmups] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/setup/days")
      .then((res) => res.json())
      .then((data) => setDayOptions(data));
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    fetch(`/api/setup/exercises?day=${encodeURIComponent(selectedDay)}`)
      .then((res) => res.json())
      .then((data) => setExerciseOptions(data));
  }, [selectedDay]);

  const refreshSetData = () => {
    if (!selectedDay || !selectedExercise) return;

    fetch(
      `/api/logging/getsetcount?day=${encodeURIComponent(
        selectedDay
      )}&exercise=${encodeURIComponent(selectedExercise)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSetCount(data.setCount);
        setLastActual(data.lastActual || "");
        setPrescribed(data.prescribed || "");
        setSuggestedWeight(data.suggestedWeight || null);
        setWarmupSets(data.warmupSets || []);
      });
  };

  const handleSubmit = () => {
    // your existing log logic here
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-3xl font-bold mb-4">Workout Logger</h1>

      {/* Existing form and inputs... */}
      <button onClick={handleSubmit}>Log Set</button>
      {message && <p className="mt-4">{message}</p>}

      {/* === Extra Logging Info and Controls === */}
      {setCount >= 3 && (
        <div className="text-red-500 text-center mb-4 font-semibold">
          Max sets reached for this exercise. All 3 sets logged.
        </div>
      )}

      {setCount < 3 && (
        <>
          {lastActual && (
            <div className="w-full max-w-md text-sm bg-gray-800 text-white p-3 rounded mb-2">
              <strong>Last Set Performed:</strong> {lastActual}
            </div>
          )}

          {prescribed && (
            <div className="w-full max-w-md text-sm bg-blue-900 text-white p-3 rounded mb-2">
              <strong>Prescribed Weight:</strong> {prescribed}
            </div>
          )}

          {suggestedWeight && (
            <div className="w-full max-w-md text-sm bg-green-900 text-white p-3 rounded mb-2">
              <strong>Suggested Weight:</strong> {suggestedWeight}
            </div>
          )}

          <button
            className="w-full max-w-md p-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600 mb-4"
            onClick={() => setShowWarmups(!showWarmups)}
          >
            {showWarmups ? "Hide Warm-Up Sets" : "Show Warm-Up Sets"}
          </button>

          {showWarmups && warmupSets.length > 0 && (
            <div className="w-full max-w-md bg-gray-700 text-white p-3 rounded mb-4">
              <strong>Warm-Up Sets:</strong>
              <ul className="list-disc list-inside mt-1">
                {warmupSets.map((set, i) => (
                  <li key={i}>{set}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="w-full max-w-md p-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 mb-6"
            onClick={() => {
              setWeight("");
              setReps("");
              setNotes("");
              setMessage("");
            }}
          >
            Reset
          </button>
        </>
      )}

      {!suggestedWeight && setCount >= 3 && (
        <button
          className="w-full max-w-md p-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 mb-6"
          onClick={() =>
            fetch("/api/addactualcolumn", { method: "POST" }).then(() =>
              setMessage("🆕 Added new 'Actual' column.")
            )
          }
        >
          ➕ Add New Actual Column
        </button>
      )}
    </main>
  );
}
