"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [dayOptions, setDayOptions] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sessionSetCount, setSessionSetCount] = useState(0); // 👈 NEW
  const [setCount, setSetCount] = useState(0); // from history (leave this)
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
  const [warmupsLogged, setWarmupsLogged] = useState(false); // 👈 NEW

  // Load Day Options
  useEffect(() => {
    fetch("/api/setup/days")
      .then((res) => res.json())
      .then((data) => setDayOptions(data));
  }, []);

  // Load Exercises for Selected Day
  useEffect(() => {
    if (!selectedDay) return;
    fetch(`/api/setup/exercises?day=${encodeURIComponent(selectedDay)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Exercises loaded:", data);
        setExerciseOptions(data);
      });
  }, [selectedDay]);

  // Load Set Count and Metadata
  const refreshSetData = () => {
    if (!selectedDay || !selectedExercise) return;

    fetch(
      `/api/logging/getsetcount?day=${encodeURIComponent(
        selectedDay
      )}&exercise=${encodeURIComponent(selectedExercise)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSetCount(data.setCount || 0);
        const cleanLast = data.lastActual?.split('(')[0].trim(); // remove any inline notes
        setLastActual(cleanLast || "");
        setPrescribed(data.prescribed || "");
        setWarmupSets(data.warmupSets || []);
        setSuggestedWeight(data.suggestedWeight || null);

        if (data.lastActual) {
          const match = data.lastActual.match(/^(\d+)\s*x\s*(\d+)$/i);
          if (match) {
            const lastWeight = parseInt(match[1], 10);
            const lastReps = parseInt(match[2], 10);
            const rir = 2;
            const adjustment = rir * 5;
            const suggested = Math.max(lastWeight - adjustment, 0);
            setSuggestedWeight({
              weight: suggested.toFixed(1),
              reps: lastReps,
            });
          }
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching getsetcount:", err);
      });
  };

  useEffect(() => {
    refreshSetData();
  }, [selectedExercise]);

  const handleLogSet = async () => {
    if (!selectedDay || !selectedExercise || !weight || !reps) {
      setMessage("Please complete all required fields.");
      return;
    }

    let finalNotes = notes.trim();

    const payload = {
      day: selectedDay,
      exercise: selectedExercise,
      weight,
      reps,
      notes: finalNotes,
      warmupSets, // Send warm-up sets from state
      currentSetNumber: sessionSetCount, // Send sessionSetCount (0-based)
    };

    const res = await fetch("/api/logging/logset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage("✅ Set logged!");
      setWeight("");
      setReps("");
      setNotes("");
      setSessionSetCount((prev) => prev + 1); // Increment session count
      refreshSetData();
    } else {
      setMessage("❌ Failed to log set.");
    }
  };

  const handleReset = () => {
    setWeight("");
    setReps("");
    setNotes("");
    setSetCount(0);
    setMessage("");
    setShowSuggested(false);
    setShowWarmups(false);
    refreshSetData();
  };

  const handleAddActualColumn = async () => {
    const res = await fetch("/api/logging/addactualcolumn", { method: "POST" });

    if (res.ok) {
      setMessage("🆕 Added new 'Actual' column.");
      refreshSetData();
    } else {
      setMessage("❌ Failed to add column.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c2541] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-3">Workout Logger</h1>

        {selectedDay && selectedExercise && (
          <p className="text-sm text-center mb-2 text-gray-300">
            Logging: Set {sessionSetCount + 1}
          </p>
        )}

        {/* Select Day */}
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
            setMessage("");
            setSessionSetCount(0); // 👈 reset session tracking
          }}
        >
          <option value="">Select Day</option>
          {dayOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Select Exercise */}
        <select
          className="w-full p-2 bg-gray-800 text-white rounded mb-4"
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

        {/* Show Logging Panel */}
        {selectedExercise && (
          <>

            {/* Warm-Up Toggle */}
            {warmupSets.length > 0 && (
              <>
                {showWarmups && (
                  <div className="bg-purple-900 text-white p-3 rounded text-sm mb-3 shadow-md">
                    <p className="font-semibold mb-1">🔥 Warm-Up Sets:</p>
                    <ul className="list-disc ml-5">
                      {warmupSets.map((set, i) => (
                        <li key={i}>
                          {set.weight} lbs × {set.reps}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setShowWarmups(!showWarmups)}
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-2 px-4 rounded mb-3 hover:from-orange-500 hover:to-pink-600 transition"
                >
                  {showWarmups ? "Hide Warm-Up Sets" : "Show Warm-Up Sets"}
                </button>
              </>
            )}

            {/* Info Box */}
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

            {/* Suggested Weight */}
            {suggestedWeight && typeof suggestedWeight === "object" && (
              <>
                <button
                  className={`w-full text-white font-semibold rounded p-2 mb-2 ${
                    showSuggested ? "bg-blue-700" : "bg-blue-600"
                  }`}
                  onClick={() => setShowSuggested(!showSuggested)}
                >
                  {showSuggested
                    ? "Hide Suggested Set"
                    : "Show Suggested Set"}
                </button>
                {showSuggested && (
                  <div className="bg-blue-900 text-white p-2 rounded text-sm mb-2">
                    <strong>Suggested Set:</strong>{" "}
                    {suggestedWeight.weight} lbs × {suggestedWeight.reps} reps
                  </div>
                )}
              </>
            )}

            {/* Inputs */}
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

            {/* Action Buttons */}
            <button
              onClick={handleLogSet}
              className="w-full bg-white text-black font-bold py-2 px-4 rounded mb-2 hover:bg-gray-200 transition"
            >
              Log Set
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded mb-2 hover:bg-red-700 transition"
            >
              Reset
            </button>

            {setCount >= 3 && (
              <button
                onClick={handleAddActualColumn}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded mb-2 hover:bg-indigo-700 transition"
              >
                ➕ Add Actual Column
              </button>
            )}
          </>
        )}

        {/* Message + Max Set Warning */}
        {message && (
          <p className="text-sm text-center mb-4 text-yellow-400">{message}</p>
        )}

        {sessionSetCount >= 3 && (
          <div className="text-red-500 text-center mb-4 font-semibold">
            Max sets reached for this exercise. All 3 sets logged.
          </div>
        )}
      </div>
    </main>
  );
}
