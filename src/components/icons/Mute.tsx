import type { IconComponentProps } from "./types";

function Mute(props: IconComponentProps) {
  const strokewidth = props.strokewidth || 1.5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={props.className}
    >
      <g fill="currentColor">
        <path
          d="m14.3919,5.6082c-.8481-1.554-2.4969-2.6082-4.3919-2.6082h0,0,0c-2.7614,0-5,2.2386-5,5v3.5c0,1.1046-.8954,2-2,2h3.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        ></path>
        <path
          d="m11.4497,13.5h5.5503c-1.1046,0-2-.8954-2-2v-1.5503"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        ></path>
        <path
          d="m7.5504,16c.2317,1.1411,1.2401,2,2.4496,2s2.2179-.8589,2.4496-2h-4.8992Z"
          fill="currentColor"
          strokeWidth="0"
        ></path>
        <line
          x1="3"
          y1="17"
          x2="17"
          y2="3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        ></line>
      </g>
    </svg>
  );
}

export default Mute;
