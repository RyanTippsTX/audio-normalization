import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Likes } from '~/components/Likes';

export default function Home() {
  // signal to track if the compressor is enabled
  const [compressorEnabled, setCompressorEnabled] = createSignal(false);

  // aggressive settings
  const [threshold, setThreshold] = createSignal(-60); // db
  const [knee, setKnee] = createSignal(0); // db
  const [ratio, setRatio] = createSignal(50); // ratio
  const [attack, setAttack] = createSignal(0); // seconds
  const [release, setRelease] = createSignal(1); // seconds
  const [gain, setGain] = createSignal(1);

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

    // If audio is enabled, set up the compressor
    if (compressorEnabled()) {
      console.log('🔥 setting up compressor !!');

      // Initialize the Audio Context once
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create Audio Nodes if not already created
      if (!sourceNode) {
        sourceNode = audioContext.createMediaElementSource(videoElement);
      }
      if (!compressor) {
        compressor = audioContext.createDynamicsCompressor();
        // Configure compressor settings
        compressor.threshold.setValueAtTime(threshold(), audioContext.currentTime); // -60 dB threshold
        compressor.knee.setValueAtTime(knee(), audioContext.currentTime); // 0 dB knee
        compressor.ratio.setValueAtTime(ratio(), audioContext.currentTime); // 50:1 compression ratio
        compressor.attack.setValueAtTime(attack(), audioContext.currentTime); // 0 ms attack
        compressor.release.setValueAtTime(release(), audioContext.currentTime); // 1 second release
      }
      if (!gainNode) {
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(gain(), audioContext.currentTime); // 1 means no change in volume
      }

      // Connect nodes if not already connected
      sourceNode.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Cleanup effect when component unmounts or audio is disabled
      onCleanup(() => {
        sourceNode?.disconnect();
        compressor?.disconnect();
        gainNode?.disconnect();
      });
    } else {
      // If audio is disabled, clean up the compressor
      if (audioContext) {
        console.log('🔥 cleaning up compressor !!');
        sourceNode?.disconnect();
        compressor?.disconnect();
        gainNode?.disconnect();
      }
    }
  });

  return (
    <main class="container mx-auto flex justify-center items-center flex-col py-16 space-y-16">
      <div class="text-4xl">Audio Normalization Demo</div>

      <video
        class="mx-auto aspect-video bg-black"
        preload="auto"
        crossOrigin="anonymous"
        controls
        width="600"
        poster="https://illudiumfilm.com/big_buck_bunny_title_658w.jpg"
      >
        <source
          id="mp4"
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>

      <button
        class="rounded-full bg-blue-500 text-white px-4 py-2"
        onClick={() => setCompressorEnabled((prev) => !prev)} // Toggle audio compressor
      >
        {compressorEnabled() ? 'Disable Compressor' : 'Enable Compressor'}
      </button>
    </main>
  );
}
