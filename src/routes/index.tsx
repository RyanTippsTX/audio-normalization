import { createEffect, createSignal } from 'solid-js';
import { Likes } from '~/components/Likes';

export default function Home() {
  // signal audioEnabled bool
  const [audioEnabled, setAudioEnabled] = createSignal(false);

  // aggressive settings
  const [threshold, setThreshold] = createSignal(-60); // db
  const [knee, setKnee] = createSignal(0); // db
  const [ratio, setRatio] = createSignal(50); // ratio
  const [attack, setAttack] = createSignal(0); // seconds
  const [release, setRelease] = createSignal(1); // seconds
  const [gain, setGain] = createSignal(1);

  createEffect(() => {
    if (!audioEnabled()) {
      return;
    }

    console.log('🔥 setting up compressor !!');

    // Step 1: Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Step 2: Select the video element
    const videoElement = document.querySelector('video');

    if (!videoElement) {
      throw new Error('Video element not found!');
    }

    // Step 3: Create a MediaElementAudioSourceNode from the video element
    const sourceNode = audioContext.createMediaElementSource(videoElement);

    // Step 4: Create a DynamicsCompressorNode
    const compressor = audioContext.createDynamicsCompressor();

    // Configure compressor settings
    compressor.threshold.setValueAtTime(threshold(), audioContext.currentTime); // -50 dB threshold
    compressor.knee.setValueAtTime(knee(), audioContext.currentTime);
    compressor.ratio.setValueAtTime(ratio(), audioContext.currentTime);
    compressor.attack.setValueAtTime(attack(), audioContext.currentTime);
    compressor.release.setValueAtTime(release(), audioContext.currentTime);

    // Step 5: Create a GainNode (optional, for additional volume control)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(gain(), audioContext.currentTime); // 1 means no change in volume

    // Step 6: Connect the nodes
    sourceNode.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Step 7: Play the video to test the effect
    videoElement.play();
  });

  return (
    <main class="container mx-auto flex justify-center items-center flex-col py-16 space-y-16">
      <div class="text-4xl">Audio Normalization Demo</div>

      <video
        class="mx-auto"
        preload="auto"
        // autoplay
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

      <Likes />
      <button
        class="rounded-full bg-blue-500 text-white px-4 py-2"
        onClick={() => setAudioEnabled(true)}
      >
        Enable Audio
      </button>
    </main>
  );
}
