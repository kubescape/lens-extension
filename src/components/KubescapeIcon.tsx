import React from "react";
import propTypes from "prop-types";

export const KubescapeIcon = function ({ size, fill = null, ...svgProps }) {
  return (
    <svg
      {...svgProps}
      viewBox="0 0 201.06 199.56"
      width={size}
      height={size}
      style={{ fill }}>
      <defs>
        <style>
          {`.cls-1 { fill: ${fill ?? "url(#linear-gradient)"};}`}
          {`.cls-2 { fill: ${fill ?? "#2916fc"};}`}
          {`.cls-3,.cls-5{ fill: ${fill ?? "#fff"};}`}
          {`.cls-4 { fill: ${fill ?? "#000d33"};}`}
          {".cls-5 { opacity:0.76;}"}
          {`.cls-6 { fill: ${fill ?? "url(#linear-gradient-2)"};}`}
        </style>
        <linearGradient id="linear-gradient" x1="957.13" y1="569.56" x2="1031.5" y2="569.56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ff7879" /><stop offset="0.21" stop-color="#fc777b" />
          <stop offset="0.36" stop-color="#f27281" /><stop offset="0.5" stop-color="#e26b8a" />
          <stop offset="0.63" stop-color="#cb6098" /><stop offset="0.75" stop-color="#ae52aa" />
          <stop offset="0.86" stop-color="#8a41c0" /><stop offset="0.98" stop-color="#602eda" />
          <stop offset="1" stop-color="#5529e0" />
        </linearGradient>
        <linearGradient id="linear-gradient-2" x1="996.83" y1="577.49" x2="1031.52" y2="577.49" xlinkHref="#linear-gradient" />
      </defs>
      <path className="cls-1" d="M1031.5,547.77l-33.13,57.36a11.32,11.32,0,0,1-1.54,2.08h-18l-16.77-29.05-5-8.61,8.5-14.72,7-12.07,6.27-10.85h43.48Z" transform="translate(-859.72 -452.72)" />
      <path className="cls-2" d="M1037.28,537.75l-5.78,10-9.16-15.86H978.86l-6.27,10.85-7,12.07-8.5,14.72,5,8.61,16.77,29.05h18a11.72,11.72,0,0,1-8.64,3.8H910.38a11.75,11.75,0,0,1-10.18-5.88l-38.9-67.38a11.78,11.78,0,0,1,0-11.77l38.9-67.38a11.77,11.77,0,0,1,10.18-5.88h77.81a11.77,11.77,0,0,1,10.18,5.88L1037.28,526A11.78,11.78,0,0,1,1037.28,537.75Z" transform="translate(-859.72 -452.72)" />
      <path className="cls-3" d="M939.94,492.05h-13.8a3.69,3.69,0,0,0-3.7,3.7V568a3.69,3.69,0,0,0,3.7,3.69h13.8a4.21,4.21,0,0,0,.62,0,3.7,3.7,0,0,0,3.08-3.64V495.75A3.7,3.7,0,0,0,939.94,492.05Zm23.31,33.58,1.24-1.83,2.09-3.11L982,497.81a3.69,3.69,0,0,0-3.06-5.76H965.81a3.68,3.68,0,0,0-3.12,1.72l-19.05,30-2.3,3.63a3.73,3.73,0,0,0-.11,3.78l2.41,4.35L950.52,548l9.34,16.85,5.77-10,6.13-10.61-8.63-14.64a3.69,3.69,0,0,1-.43-2.69A3.81,3.81,0,0,1,963.25,525.63Z" transform="translate(-859.72 -452.72)" />
      <path className="cls-4" d="M1060.08,565a14.64,14.64,0,0,0-1.3-3l-22.56-39.08a15.09,15.09,0,0,0-13.06-7.53H978a15.15,15.15,0,0,0-13,7.53l-.49.86-1.79,3.09L956,538.5,950.52,548l-6.88,11.93L942.42,562l-.12.23a15.18,15.18,0,0,0,.12,14.85L965,616.17a15.13,15.13,0,0,0,13,7.54h45.13a14.19,14.19,0,0,0,1.47-.07l16,25.61a6.51,6.51,0,0,0,8.93,2l1-.61a6.49,6.49,0,0,0,2.07-8.92l-16.23-25.92,22.38-38.75A15.16,15.16,0,0,0,1060.08,565Zm-20.92,13.09-16.82,29.14H978.86L962.1,578.16l-5-8.61,2.73-4.72,5.77-10,6.13-10.61.84-1.46,6.26-10.85h43.48l9.18,15.89,12.55,21.75Z" transform="translate(-859.72 -452.72)" />
      <path className="cls-5" d="M981.48,571.68H965.84a3.72,3.72,0,0,1-3.24-1.9l-2.74-4.95,5.77-10,6.13-10.61,12.9,21.89A3.69,3.69,0,0,1,981.48,571.68Z" transform="translate(-859.72 -452.72)" />
      <path className="cls-6" d="M1031.52,547.81l-34.31,59.4h-.38a11.32,11.32,0,0,0,1.54-2.08l33.13-57.36Z" transform="translate(-859.72 -452.72)" />

    </svg>
  );
};

KubescapeIcon.propTypes = {
  size: propTypes.number,
  fill: propTypes.string,
};

KubescapeIcon.defaultProps = {
  size: 16,
};
