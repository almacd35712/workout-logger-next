'use client';
import { useEffect, useState } from 'react';
console.log("🔧 [DEBUG] Loaded: ../pages/saved-ui/clean-ui-mobile-first.js");

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

  useEffect(() => {
    fetch("/api/days")
      .then((res) => res.json())
      .then((data) => setDayOptions(data));
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    fetch(`/api/exercises?day=${encodeURIComponent(selectedDay)}`)
      .then((res) => res.json())
      .then((data) => setExerciseOptions(data));
  }, [selectedDay]);

  useEffect(() => {
    if (!selectedDay || !selectedExercise) return;
    fetch(
      `/api/getsetcount?day=${encodeURIComponent(
        selectedDay
      )}&exercise=${encodeURIComponent(selectedExercise)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSetCount(data.setCount || 0);
        setLastActual(data.lastActual || "");
        setPrescribed(data.prescribed || "");
        setSuggestedWeight(data.suggestedWeight || null);
        setWarmupSets(data.warmupSets || []);
      });
  }, [selectedDay, selectedExercise]);

  return (
    <main className="min-h-screen bg-[#0b132b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c2541] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-1">Workout Logger</h1>
        {selectedDay && selectedExercise && (
          <p className="text-sm text-center mb-4 text-gray-300">
            Logging: Set {Math.min(setCount + 1, 3)}
          </p>
        )}
        <div className="mb-2">
          <select
            className="w-full p-2 bg-gray-800 text-white rounded mb-2"
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setSelectedExercise("");
              setSetCount(0);
              setLastActual("");
              setPrescribed("");
              setSuggestedWeight(null);
              setWarmupSets([]);
              setShowWarmups(false);
              setShowSuggested(false);
            }}
          >
            <option value="">Select Day</option>
            {dayOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={selectedExercise}
            onChange={(e) => {
              setSelectedExercise(e.target.value);
              setSetCount(0);
              setLastActual("");
              setPrescribed("");
              setSuggestedWeight(null);
              setWarmupSets([]);
              setShowWarmups(false);
              setShowSuggested(false);
            }}
            disabled={!selectedDay}
          >
            <option value="">Select Exercise</option>
            {Array.isArray(exerciseOptions) &&
              exerciseOptions.map((ex) => (
                <option key={ex.value} value={ex.value}>
                  {ex.label}
                </option>
              ))}
          </select>
        </div>

        {selectedExercise && (
          <div className="bg-gray-800 rounded p-2 text-sm mb-2">
            <div>
              <strong>Last Actual:</strong>{" "}
              {lastActual ? lastActual : "Not Logged Yet"}
            </div>
            {prescribed && (
              <div>
                <strong>Prescribed:</strong> {prescribed}
              </div>
            )}
          </div>
        )}

        <input
          type="text"
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="text"
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <textarea
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="w-full p-3 bg-white text-black font-bold rounded mb-2">
          Log Set
        </button>
        <div className="text-xs text-center underline cursor-pointer mb-4">
          ↻ Reset
        </div>

        {/* Toggle buttons + optional displays */}
        {suggestedWeight && (
          <>
            <button
              className={`w-full text-white font-semibold rounded p-2 mb-2 ${
                showSuggested ? "bg-green-700" : "bg-green-600"
              }`}
              onClick={() => setShowSuggested(!showSuggested)}
            >
              {showSuggested ? "Hide Suggested Weight" : "Show Suggested Weight"}
            </button>

            {showSuggested && (
              <div className="bg-green-900 p-2 rounded text-sm mb-2">
                <strong>Suggested Working Weight:</strong> {suggestedWeight} lbs
              </div>
            )}
          </>
        )}

        {warmupSets.length > 0 && (
          <>
            <button
              className={`w-full text-white font-semibold rounded p-2 mb-2 ${
                showWarmups ? "bg-purple-700" : "bg-purple-600"
              }`}
              onClick={() => setShowWarmups(!showWarmups)}
            >
              {showWarmups ? "Hide Warm-Ups" : "Show Warm-Ups"}
            </button>

            {showWarmups && (
              <div className="bg-purple-900 p-2 rounded text-sm mb-2">
                <strong>Warm-Up Sets:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {warmupSets.map((set, i) => (
                    <li key={i}>
                      WU: {set.weight} x {set.reps}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
