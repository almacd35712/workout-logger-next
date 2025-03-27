import { useEffect, useState } from 'react';

export default function Home() {
  const [day, setDay] = useState('');
  const [exercise, setExercise] = useState('');
  const [dayOptions, setDayOptions] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');
  const [setCount, setSetCount] = useState(1);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [blockLogging, setBlockLogging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchDays = async () => {
      const res = await fetch('/api/days');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDayOptions(data);
      } else {
        console.error('Invalid day options response:', data);
        setDayOptions([]);
      }
    };
    fetchDays();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!day) return;
      const res = await fetch(`/api/exercises?day=${encodeURIComponent(day)}`);
      const data = await res.json();
      setExerciseOptions(data);
    };
    fetchExercises();
  }, [day]);

  useEffect(() => {
    const fetchSetCount = async () => {
      if (!day || !exercise) return;
      try {
        const res = await fetch(`/api/getsetcount?day=${encodeURIComponent(day)}&exercise=${encodeURIComponent(exercise)}`);
        const data = await res.json();

        if (!isNaN(data.setCount)) {
          setSetCount(data.setCount + 1);
          setShowAddColumn(data.showAddColumn || false);

          if (data.setCount >= 3) {
            setBlockLogging(true);
            setStatusMessage("You’ve already logged 3 sets for this exercise.");
          } else {
            setBlockLogging(false);
            setStatusMessage('');
          }
        } else {
          console.error('Invalid setCount response:', data);
          setSetCount(1);
          setBlockLogging(false);
          setStatusMessage('');
        }
      } catch (error) {
        console.error('Error fetching set count:', error);
        setSetCount(1);
        setBlockLogging(false);
        setStatusMessage('');
      }
    };
    fetchSetCount();
  }, [day, exercise]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blockLogging) return;

    const payload = { day, exercise, weight, reps, notes };
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message || 'Logged!');

      setWeight('');
      setReps('');
      setNotes('');
      setSetCount((prev) => prev + 1);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const handleAddColumn = async () => {
    try {
      const res = await fetch('/api/add-actual-column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day }),
      });
      const data = await res.json();
      alert(data.message || 'Column added!');

      // Refresh set count
      setExercise(''); // Reset exercise to force refresh
    } catch (error) {
      console.error('Failed to add column:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Workout Logger</h1>
        <h2 className="text-lg mb-4 text-center">
          Logging: Set {isNaN(setCount) ? 1 : setCount}
        </h2>

        <label className="block mb-2">Day</label>
        <select
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        >
          <option value="">Select Day</option>
          {Array.isArray(dayOptions) &&
            dayOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>

        <label className="block mb-2">Exercise</label>
        <select
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
        >
          <option value="">Select Exercise</option>
          {exerciseOptions.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Weight (lbs)"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={blockLogging}
        />
        <input
          type="text"
          placeholder="Reps"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          disabled={blockLogging}
        />
        <textarea
          placeholder="Notes"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={blockLogging}
        />

        {statusMessage && (
          <p className="text-yellow-400 mb-4 text-center">{statusMessage}</p>
        )}

        {showAddColumn && (
          <button
            type="button"
            onClick={handleAddColumn}
            className="w-full bg-yellow-400 text-black py-2 rounded font-semibold mb-4"
          >
            Add Actual Column
          </button>
        )}

        <button
          type="submit"
          disabled={blockLogging}
          className={`w-full py-2 rounded font-semibold ${
            blockLogging
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-white text-black'
          }`}
        >
          Log Set
        </button>
      </form>
    </div>
  );
}
