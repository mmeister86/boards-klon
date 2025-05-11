"use client";

import React, { useState } from "react";

const VideoOptimizerTest = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<{
    message: string;
    storageUrl: string;
    previewUrl512: string | null;
    previewUrl128: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file || null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const res = await fetch("/api/optimize-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        setError(null);
      } else {
        setError(data.error || "An error occurred.");
        setResponse(null);
      }
    } catch (e) {
      setError((e as Error).message || "An error occurred.");
      setResponse(null);
    }
  };

  return (
    <div>
      <h2>Video Optimizer Test</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button type="submit">Optimize Video</button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {response && (
        <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VideoOptimizerTest;
