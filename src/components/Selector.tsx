import { useCallback } from "react";

type Props<T extends string | number> = {
  name: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

/*
 * The <select> DOM element only speaks strings, so options are keyed by
 * index: the chosen index looks the original option back up, and callers
 * send and receive their own type.
 */
export function Selector<T extends string | number>({
  name,
  options,
  value,
  onChange,
}: Props<T>) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = options[Number(e.target.value)];
      if (option !== undefined) {
        onChange(option);
      }
    },
    [options, onChange],
  );

  return (
    <select
      id={name}
      name={name}
      value={options.indexOf(value)}
      onChange={handleChange}
      className="mx-2 rounded-lg border-0 bg-transparent text-zinc-900 ring-1 ring-inset ring-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-600 sm:text-base"
    >
      {options.map((opt, index) => (
        <option key={opt} value={index}>
          {opt}
        </option>
      ))}
    </select>
  );
}
