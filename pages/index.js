"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [setCount, setSetCount] = useState(1);
  const [logStatus, setLogStatus] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

  useEffect(() => {
    const fetchDays = async () => {
      const response = await fetch("/api/days");
      const data = await response.json();
      setDays(data);
    };
    fetchDays();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!selectedDay) return;
      try {
        const response = await axios.get(`/api/exercises?day=${encodeURIComponent(selectedDay)}`);
        if (Array.isArray(response.data)) {
          setExerciseOptions(response.data);
        } else {
          setExerciseOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setExerciseOptions([]);
      }
    };

    fetchExercises();
  }, [selectedDay]);

  useEffect(() => {
    const fetchSetCount = async () => {
      if (selectedDay && selectedExercise) {
        const response = await axios.get(`/api/getsetcount?day=${encodeURIComponent(selectedDay)}&exercise=${encodeURIComponent(selectedExercise)}`);
        const data = response.data;
        setSetCount(data.setCount + 1);
        setShowAddColumn(data.showAddColumn);
      }
    };
    fetchSetCount();
  }, [selectedDay, selectedExercise]);

  const handleLog = async () => {
    const payload = {
      day: selectedDay,
      exercise: selectedExercise,
      weight,
      reps,
      notes,
    };

    try {
      const response = await axios.post("/api/log", payload);
      setLogStatus("✅ Set logged!");
      setSetCount((prev) => prev + 1);
    } catch (error) {
      setLogStatus("❌ Failed to log set");
      console.error(error);
    }
  };

  const handleAddColumn = async () => {
    try {
      const response = await axios.post("/api/add-actual-column", { day: selectedDay });
      if (response.data.success) {
        setLogStatus("✅ New column added!");
        setSetCount(1);
        setShowAddColumn(false);
      } else {
        setLogStatus("❌ Could not add column.");
      }
    } catch (err) {
      console.error("Error adding column:", err);
      setLogStatus("❌ Error adding column.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Workout Logger</h1>
        <p className="text-center mb-2">Logging: Set {setCount}</p>

        <label className="block mb-2">Day</label>
        <select
          className="w-full p-2 mb-4 rounded text-black"
          value={selectedDay}
          onChange={(e) => {
            setSelectedDay(e.target.value);
            setSelectedExercise("");
            setSetCount(1);
            setShowAddColumn(false);
          }}
        >
          <option value="">Select Day</option>
          {Array.isArray(days) &&
            days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
        </select>

        <label className="block mb-2">Exercise</label>
        <select
          className="w-full p-2 mb-4 rounded text-black"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          <option value="">Select Exercise</option>
          {Array.isArray(exerciseOptions) &&
            exerciseOptions.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
        </select>

        <input
          type="text"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-2 mb-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-full p-2 mb-2 rounded text-black"
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        {setCount > 3 && !showAddColumn && (
          <p className="text-yellow-400 mb-4">You’ve already logged 3 sets for this exercise.</p>
        )}

        {showAddColumn ? (
          <button
            onClick={handleAddColumn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Actual Column for This Week
          </button>
        ) : (
          <button
            onClick={handleLog}
            disabled={setCount > 3}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Log Set
          </button>
        )}

        {logStatus && <p className="mt-4 text-center">{logStatus}</p>}
      </div>
    </main>
  );
}
