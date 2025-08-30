 const piano = document.getElementById("piano");
    const volumeControl = document.getElementById("volume");

    const notes = [
      "A0", "A#0", "B0",
      ...Array.from({ length: 7 }, (_, o) => [
        `C${o+1}`, `C#${o+1}`, `D${o+1}`, `D#${o+1}`,
        `E${o+1}`, `F${o+1}`, `F#${o+1}`, `G${o+1}`, `G#${o+1}`,
        `A${o+1}`, `A#${o+1}`, `B${o+1}`
      ]).flat(),
      "C8"
    ];

    notes.forEach(note => {
      const isSharp = note.includes("#");
      const key = document.createElement("div");
      key.classList.add(isSharp ? "black-key" : "white-key");
      key.dataset.note = note;

      key.addEventListener("mousedown", () => {
        playNote(note);
        key.classList.add("active");
        showFloatingNote(key, note);
        recordNote(note);
      });

      key.addEventListener("mouseup", () => key.classList.remove("active"));
      piano.appendChild(key);
    });

    const whiteKeys = document.querySelectorAll(".white-key");
    const blackKeys = document.querySelectorAll(".black-key");
    blackKeys.forEach(blackKey => {
      const idx = notes.indexOf(blackKey.dataset.note);
      const whitesBefore = notes.slice(0, idx).filter(n => !n.includes("#")).length;
      const whiteKey = whiteKeys[whitesBefore];
      if (whiteKey) {
        blackKey.style.left = whiteKey.offsetLeft + 30 + "px";
      }
    });

    function playNote(note) {
      const audio = document.getElementById(note);
      if (audio) {
        audio.volume = parseFloat(volumeControl.value);
        audio.play().catch(err => console.error(`Failed to play ${note}:`, err));
      }
    }

    function showFloatingNote(keyEl, note) {
      const float = document.createElement("div");
      float.className = "floating-note";
      float.innerText = note;
      keyEl.appendChild(float);
      setTimeout(() => keyEl.removeChild(float), 1000);
    }

    const recordBtn = document.getElementById("recordBtn");
    const stopBtn = document.getElementById("stopBtn");
    const playBtn = document.getElementById("playBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    let isRecording = false;
    let startTime = 0;
    let recordedNotes = [];

    function recordNote(note) {
      if (!isRecording) return;
      const time = Date.now() - startTime;
      recordedNotes.push({ note, time });
    }

    recordBtn.addEventListener("click", () => {
      recordedNotes = [];
      isRecording = true;
      startTime = Date.now();
      recordBtn.disabled = true;
      stopBtn.disabled = false;
      playBtn.disabled = true;
      downloadBtn.disabled = true;
    });

    stopBtn.addEventListener("click", () => {
      isRecording = false;
      stopBtn.disabled = true;
      playBtn.disabled = recordedNotes.length === 0;
      downloadBtn.disabled = recordedNotes.length === 0;
      recordBtn.disabled = false;
    });

    playBtn.addEventListener("click", () => {
      if (recordedNotes.length === 0) return;
      playBtn.disabled = true;
      recordBtn.disabled = true;
      stopBtn.disabled = true;

      recordedNotes.forEach(({ note, time }, index) => {
        setTimeout(() => {
          const key = [...document.querySelectorAll("[data-note]")].find(k => k.dataset.note === note);
          if (key) {
            key.classList.add("active");
            showFloatingNote(key, note);
            playNote(note);
            setTimeout(() => key.classList.remove("active"), 200);
          }
          if (index === recordedNotes.length - 1) {
            playBtn.disabled = false;
            recordBtn.disabled = false;
          }
        }, time);
      });
    });

    downloadBtn.addEventListener("click", () => {
      if (recordedNotes.length === 0) return;
      const blob = new Blob([JSON.stringify(recordedNotes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  