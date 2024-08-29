import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Slider } from '~/components/Slider';

export default function Home() {
  // signal to track if the compressor is enabled
  const [compressorEnabled, setCompressorEnabled] = createSignal(false);

  // aggressive settings
  const [threshold, setThreshold] = createSignal(-60); // db
  const [knee, setKnee] = createSignal(3); // db
  const [ratio, setRatio] = createSignal(45); // ratio
  const [attack, setAttack] = createSignal(0.01); // seconds
  const [release, setRelease] = createSignal(1); // seconds
  const [gain, setGain] = createSignal(1); // gain

  // Audio context, nodes, and compressor setup
  let audioContext: AudioContext | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let gainNode: GainNode | null = null;

  createEffect(() => {
    // Get the video element
    const videoElement = document.querySelector('video');
    if (!videoElement) {
      throw new Error('Video element not found!');
    }

    // Initialize the Audio Context once
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Create Audio Nodes if not already created
    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(videoElement);
    }
    if (!gainNode) {
      gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(gain(), audioContext.currentTime); // 1 means no change in volume
    }

    if (compressorEnabled()) {
      console.log('🔥 setting up compressor !!');

      // Create Compressor Node if not already created
      if (!compressor) {
        compressor = audioContext.createDynamicsCompressor();
        updateCompressorSettings();
      }

      // Connect nodes: source -> compressor -> gain -> destination
      sourceNode.disconnect(); // Ensure no duplicate connections
      sourceNode.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(audioContext.destination);
    } else {
      console.log('🔥 bypassing compressor !!');

      // Bypass Compressor & Gain: source -> destination
      sourceNode.disconnect();
      compressor?.disconnect();
      gainNode?.disconnect();
      sourceNode.connect(audioContext.destination);
    }

    // Cleanup effect when component unmounts
    onCleanup(() => {
      sourceNode?.disconnect();
      compressor?.disconnect();
      gainNode?.disconnect();
    });
  });

  // Function to update compressor settings dynamically
  function updateCompressorSettings() {
    if (!compressor || !gainNode || !audioContext) return;

    compressor.threshold.setValueAtTime(threshold(), audioContext.currentTime);
    compressor.knee.setValueAtTime(knee(), audioContext.currentTime);
    compressor.ratio.setValueAtTime(ratio(), audioContext.currentTime);
    compressor.attack.setValueAtTime(attack(), audioContext.currentTime);
    compressor.release.setValueAtTime(release(), audioContext.currentTime);

    gainNode.gain.setValueAtTime(gain(), audioContext?.currentTime || 0);
  }

  return (
    <main class="container mx-auto flex justify-center items-center flex-col py-16 space-y-8">
      <div class="text-4xl">Audio Normalization Demo</div>

      <video
        class="mx-auto"
        preload="auto"
        crossOrigin="anonymous"
        controls
        autoplay={false}
        width="600"
        poster="https://illudiumfilm.com/big_buck_bunny_title_658w.jpg"
      >
        <source
          id="mp4"
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>

      {/* Button to toggle audio compressor */}
      <button
        class="rounded-full bg-blue-500 text-white px-4 py-2"
        onClick={() => setCompressorEnabled((prev) => !prev)} // Toggle audio compressor
      >
        {compressorEnabled() ? 'Disable Compressor' : 'Enable Compressor'}
      </button>

      {/* Sliders to adjust compressor settings */}
      <div class="w-full max-w-lg space-y-4">
        {/* Threshold Slider */}
        <Slider
          id="thresholdSlider"
          label="Threshold (dB)"
          description="The level above which compression is applied. A lower threshold means more of the signal will be compressed."
          min={-100}
          max={0}
          step={1}
          value={threshold()}
          onInput={(newValue) => {
            setThreshold(newValue);
            updateCompressorSettings();
          }}
        />

        {/* Knee Slider */}
        <Slider
          id="kneeSlider"
          label="Knee (dB)"
          description="The range above the threshold where the compression curve starts to take effect. A higher value makes the compression smoother."
          min={0}
          max={40}
          step={1}
          value={knee()}
          onInput={(newValue) => {
            setKnee(newValue);
            updateCompressorSettings();
          }}
        />

        {/* Ratio Slider */}
        <Slider
          id="ratioSlider"
          label="Ratio"
          description="The amount of compression (e.g., 12:1 means for every 12 dB above the threshold, only 1 dB will pass through)."
          min={1}
          max={50}
          step={1}
          value={ratio()}
          onInput={(newValue) => {
            setRatio(newValue);
            updateCompressorSettings();
          }}
        />

        {/* Attack Slider */}
        <Slider
          id="attackSlider"
          label="Attack (s)"
          description="How quickly the compressor starts to compress the signal after it exceeds the threshold."
          min={0}
          max={0.25}
          step={0.001}
          value={attack()}
          onInput={(newValue) => {
            setAttack(newValue);
            updateCompressorSettings();
          }}
        />

        {/* Release Slider */}
        <Slider
          id="releaseSlider"
          label="Release (s)"
          description="How quickly the compressor stops compressing after the signal drops below the threshold."
          min={0}
          max={2}
          step={0.01}
          value={release()}
          onInput={(newValue) => {
            setRelease(newValue);
            updateCompressorSettings();
          }}
        />

        {/* Gain Slider */}
        <Slider
          id="gainSlider"
          label="Gain"
          description="The output gain of the compressor. A value of 1 means no change in volume."
          min={0}
          max={3}
          step={0.1}
          value={gain()}
          onInput={(newValue) => {
            setGain(newValue);
            updateCompressorSettings();
          }}
        />
      </div>
    </main>
  );
}
