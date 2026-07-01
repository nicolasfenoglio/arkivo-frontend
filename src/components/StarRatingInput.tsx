import { useState } from "react";

interface StarRatingInputProps {
  name?: string;
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  disabled?: boolean;
  required?: boolean;
}

export default function StarRatingInput({
  name,
  value,
  onChange,
  max = 5,
  disabled = false,
  required = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayedRating = hovered ?? value;

  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}

      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Seleccionar valoración"
        onMouseLeave={() => setHovered(null)}
      >
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
              disabled={disabled}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-6 w-6 transition-colors ${
                  star <= displayedRating ? "text-star" : "text-border"
                }`}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </>
  );
}
