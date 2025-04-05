"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [sheetId, setSheetId] = useState("");
  const [tabTitle, setTabTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config/get")
      .then((res) => res.json())
      .then((data) => {
        setSheetId(data.sheetId);
        setTabTitle(data.title);
      });
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/config/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetId, title: tabTitle }),
    });

    const result = await res.json();
    setMessage(result.message || "✅ Saved!");
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1c2541] p-6 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">Settings</h1>
        <label className="block mb-2 text-sm">Google Sheet ID</label>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
        />

        <label className="block mb-2 text-sm">Tab Title</label>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          value={tabTitle}
          onChange={(e) => setTabTitle(e.target.value)}
        />

        <button
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 font-bold"
          onClick={handleSave}
        >
          Save
        </button>

        {message && (
          <p className="text-sm mt-4 text-yellow-300 text-center">{message}</p>
        )}
      </div>
    </main>
  );
}
