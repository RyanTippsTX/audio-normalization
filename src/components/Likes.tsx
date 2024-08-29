import { createSignal } from 'solid-js';

export function Likes() {
  const [likes, setLikes] = createSignal(0);

  return (
    <div
      class="
      min-w-24
      rounded-full 
      bg-gray-100 border-2 border-gray-300 
      hover:bg-gray-200 
      text-zinc-700
      cursor-pointer 
      px-4 py-1
      flex justify-center items-center space-x-3
      text-xl font-semibold
      select-none
      "
      onClick={() => setLikes(likes() + 1)}
    >
      <span>👍</span>
      <span>{likes()}</span>
    </div>
  );
}
