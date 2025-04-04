"use client";
import { useEffect, useState } from "react";

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
  const [selectedDayLabel, setSelectedDayLabel] = useState("");

  useEffect(() => {
    fetch("/api/setup/days")
      .then((res) => res.json())
      .then((data) =>
        setDayOptions(
          data.map((d) => ({
            label: d.label, // "Day 1"
            value: d.value, // "Chest"
          }))
        )
      );
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
        console.log("🔍 getsetcount response:", data);
        setSetCount(data.setCount || 0);
        setLastActual(data.lastActual || "");
        setPrescribed(data.prescribed || "");
        setSuggestedWeight(data.suggestedWeight || null);
        setWarmupSets(data.warmupSets || []);
      })
      .catch((err) => {
        console.error("❌ Error fetching getsetcount:", err);
        setMessage("❌ Could not fetch data for this exercise.");
        setSetCount(0);
        setLastActual("");
        setPrescribed("");
        setSuggestedWeight(null);
        setWarmupSets([]);
      });
  };

  useEffect(() => {
    refreshSetData();
  }, [selectedDay, selectedExercise]);

  const handleSubmit = async () => {
    if (!selectedDay || !selectedExercise || !weight || !reps) {
      setMessage("Please complete all required fields.");
      return;
    }

    const payload = {
      day: selectedDay,
      exercise: selectedExercise,
      weight,
      reps,
      notes,
    };

    const res = await fetch("/api/logging/logset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage("✅ Set logged!");
      setWeight("");
      setReps("");
      setNotes("");
      refreshSetData();
    } else {
      setMessage("❌ Failed to log set.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c2541] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-1">Workout Logger</h1>
        {selectedDay && selectedExercise && (
          <p className="text-sm text-center mb-4 text-gray-300">
            Logging: Set {setCount + 1} for {selectedDayLabel}
          </p>
        )}

        <select
          className="w-full p-2 bg-gray-800 text-white rounded mb-2"
          value={selectedDay}
          onChange={(e) => {
            const rawLabel = e.target.value; // Get the selected label
            const matchedDay = dayOptions.find((d) => d.label === rawLabel); // Find the matching day by label
            const actualValue = matchedDay?.value || ""; // Get the actual value (e.g., "Chest")
            setSelectedDay(actualValue); // Set the value to be sent to the backend
            setSelectedDayLabel(rawLabel); // Set the label for display purposes
            setSelectedExercise("");
            setSetCount(0);
            setLastActual("");
            setPrescribed("");
            setSuggestedWeight(null);
            setWarmupSets([]);
            setShowWarmups(false);
            setShowSuggested(false);
            setMessage("");
          }}
        >
          <option value="">Select Day</option>
          {dayOptions.map((d) => (
            <option key={d.label} value={d.label}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 bg-gray-800 text-white rounded"
          value={selectedExercise}
          onChange={(e) => {
            setSelectedExercise(e.target.value);
            setMessage("");
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

        {selectedExercise && (
          <div className="bg-gray-800 rounded p-2 text-sm mb-2">
            <div>
              <strong>Last Set Performed:</strong>{" "}
              {lastActual || "Not Logged Yet"}
            </div>
            {prescribed && (
              <div>
                <strong>Prescribed:</strong> {prescribed}
              </div>
            )}
          </div>
        )}

        {suggestedWeight && (
          <>
            <button
              className={`w-full text-white font-semibold rounded p-2 mb-2 ${
                showSuggested ? "bg-green-700" : "bg-green-600"
              }`}
              onClick={() => setShowSuggested(!showSuggested)}
            >
              {showSuggested
                ? "Hide Suggested Weight"
                : "Show Suggested Weight"}
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
                <strong>WU:</strong>{" "}
                {warmupSets.map((s) => `${s.weight}x${s.reps}`).join(", ")}
              </div>
            )}
          </>
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

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-white text-black font-bold rounded mb-2"
        >
          Log Set
        </button>

        {message && (
          <p className="text-sm text-center mb-4 text-yellow-400">{message}</p>
        )}

        {setCount >= 3 && (
          <div className="text-red-500 text-center mb-4 font-semibold">
            Max sets reached for this exercise. All 3 sets logged.
          </div>
        )}

        {selectedExercise && (
          <button
            className="w-full p-2 bg-red-600 text-white font-bold rounded mb-2 hover:bg-red-700"
            onClick={() => {
              setWeight("");
              setReps("");
              setNotes("");
              setMessage("");
              setShowSuggested(false);
              setShowWarmups(false);
            }}
          >
            Reset
          </button>
        )}

        {setCount >= 3 && (
          <button
            className="w-full p-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 mb-2"
            onClick={async () => {
              const res = await fetch("/api/logging/addactualcolumn", {
                method: "POST",
              });

              if (res.ok) {
                setMessage("🆕 Added new 'Actual' column.");
                refreshSetData();
              } else {
                setMessage("❌ Failed to add column.");
              }
            }}
          >
            ➕ Add Actual Column
          </button>
        )}
      </div>
    </main>
  );
}
