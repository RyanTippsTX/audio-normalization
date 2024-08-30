import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Slider } from '~/components/Slider';
import clsx from 'clsx';
import { Graph } from '~/components/Graph';

export default function Home() {
  // signal to track if the compressor is enabled
  const [compressorEnabled, setCompressorEnabled] = createSignal(false);

  // aggressive defaults
  const [threshold, setThreshold] = createSignal(-60); // db
  const [knee, setKnee] = createSignal(3); // db
  const [ratio, setRatio] = createSignal(20); // ratio
  const [attack, setAttack] = createSignal(0.01); // seconds
  const [release, setRelease] = createSignal(1); // seconds
  const [gain, setGain] = createSignal(1); // gain

  // Audio context, nodes, and compressor setup
  let audioContext: AudioContext | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let gainNode: GainNode | null = null;

  // Function to initialize the AudioContext and nodes
  const initializeAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const videoElement = document.querySelector('video');
      if (!videoElement) {
        throw new Error('Video element not found!');
      }
      sourceNode = audioContext.createMediaElementSource(videoElement);
      gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(gain(), audioContext.currentTime);
    }
  };

  createEffect(() => {
    if (compressorEnabled()) {
      console.log('🔥 setting up compressor !!');
      initializeAudioContext();
      if (!audioContext || !sourceNode || !gainNode) {
        throw new Error('Audio context or source node not initialized!');
      }

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
      sourceNode?.disconnect();
      compressor?.disconnect();
      gainNode?.disconnect();
      audioContext && sourceNode?.connect(audioContext.destination);
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
      <div class="text-4xl text-center">Audio Normalization Demo</div>

      <video
        class="mx-auto bg-black aspect-video"
        preload="auto"
        crossOrigin="anonymous"
        controls
        autoplay={false}
        webkit-playsinline
        playsinline
        width="600"
        poster="big_buck_bunny_title_658w.jpg"
      >
        <source
          id="mp4"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>

      {/* Button to toggle audio compressor */}
      <button
        class={clsx(
          'rounded-full bg-blue-500 text-white px-4 py-2',
          compressorEnabled() ? 'bg-red-500' : 'bg-blue-500'
        )}
        onClick={() => setCompressorEnabled((prev) => !prev)} // Toggle audio compressor
      >
        {compressorEnabled() ? 'Disable Compressor' : 'Enable Compressor'}
      </button>

      {/* MDN Docs & source code */}
      <div class="flex flex-xcol items-center justify-center space-x-2">
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode"
          target="_blank"
          rel="noreferrer"
          class="text-blue-500 text-smx hover:underline"
        >
          MDN Docs
        </a>
        <span>/</span>
        <a
          href="https://github.com/RyanTippsTX/audio-normalization/blob/master/src/routes/index.tsx"
          target="_blank"
          rel="noreferrer"
          class="text-blue-500 text-smx hover:underline"
        >
          Source Code
        </a>
      </div>

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
          max={20}
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
      <Graph />
    </main>
  );
}
