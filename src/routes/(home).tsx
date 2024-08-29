export default function Home() {
  return (
    <main class="container mx-auto">
      <div class="text-center py-20">
        <div class="text-4xl">Audio Normalization Demo</div>
      </div>
      <div>
        <video
          class="mx-auto"
          preload="auto"
          // autoplay
          controls
          width="600"
          poster="https://assets.codepen.io/32795/poster.png"
        >
          <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
        </video>
      </div>
    </main>
  );
}
