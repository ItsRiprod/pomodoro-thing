import { IconComponentProps } from "./types";

function Pause(props: IconComponentProps) {
  const strokewidth = props.strokewidth || 1.5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokewidth}
      stroke="currentColor"
      className={props.className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
      />
    </svg>
  );
}

export default Pause;
