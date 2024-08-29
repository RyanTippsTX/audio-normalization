import { createSignal } from 'solid-js';

export function Slider(props: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onInput: (value: number) => void;
}) {
  const [value, setValue] = createSignal(props.value);

  // Update the parent component's state whenever the slider value changes
  const handleInput = (e: any) => {
    const newValue = parseFloat(e.currentTarget.value);
    setValue(newValue);
    props.onInput(newValue); // Call parent update function
  };

  return (
    <div class="w-full">
      <label for={props.id} class="block mb-2">
        {props.label}: {value()} (Min: {props.min}, Max: {props.max})
      </label>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={value()}
        onInput={handleInput}
        class="w-full"
      />
    </div>
  );
}
