import React from 'react';
import { SvgXml } from 'react-native-svg';

/**
 * ShieldIcon renders a customizable shield SVG.
 * Props:
 *  - width: width of the icon
 *  - height: height of the icon
 *  - primaryColor: fill color for the shield background
 *  - secondaryColor: fill color for the accent bar
 *  - secondaryOpacity: opacity for the accent bar
 *  - ...props: any other SvgXml props
 */
const ShieldIcon = ({
  width = 200,
  height = 200,
  primaryColor = '#A0FFD5',
  secondaryColor = '#57C091',
  secondaryOpacity = 0.8,
  ...props
}) => {
  const xml = `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_dii_9_558)">
    <path d="M56.0664 164.167C62.8997 156.833 73.3164 157.417 79.3164 165.417L87.7331 176.667C94.4831 185.583 105.4 185.583 112.15 176.667L120.566 165.417C126.566 157.417 136.983 156.833 143.816 164.167C158.65 180 170.733 174.75 170.733 152.583V58.6666C170.733 25.0833 162.9 16.6666 131.4 16.6666H68.3997C36.8997 16.6666 29.0664 25.0833 29.0664 58.6666V152.5C29.1497 174.75 41.3164 179.917 56.0664 164.167Z" fill="${primaryColor}"/>
  </g>
  <g filter="url(#filter1_dii_9_558)">
    <path d="M122.916 89.5834H77.083C73.6663 89.5834 70.833 86.75 70.833 83.3334C70.833 79.9167 73.6663 77.0834 77.083 77.0834H122.916C126.333 77.0834 129.166 79.9167 129.166 83.3334C129.166 86.75 126.333 89.5834 122.916 89.5834Z" fill="${secondaryColor}" fill-opacity="${secondaryOpacity}" shape-rendering="crispEdges"/>
  </g>
  <defs>
    <filter id="filter0_dii_9_558" x="20.0664" y="7.66663" width="165.667" height="191.688" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="6" dy="6"/>
      <feGaussianBlur stdDeviation="4"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0235294 0 0 0 0 0.478431 0 0 0 0 0.27451 0 0 0 0.3 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9_558"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9_558" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="-10" dy="-11"/>
      <feGaussianBlur stdDeviation="4.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0235294 0 0 0 0 0.478431 0 0 0 0 0.27451 0 0 0 0.5 0"/>
      <feBlend mode="normal" in2="shape" result="effect2_innerShadow_9_558"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="15" dy="16"/>
      <feGaussianBlur stdDeviation="9.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0235294 0 0 0 0 0.478431 0 0 0 0 0.27451 0 0 0 0.4 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_9_558" result="effect3_innerShadow_9_558"/>
    </filter>
    <filter id="filter1_dii_9_558" x="68.833" y="69.0834" width="74.333" height="34.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="6" dy="6"/>
      <feGaussianBlur stdDeviation="4"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.298039 0 0 0 0 0.631373 0 0 0 0 0.482353 0 0 0 0.4 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9_558"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9_558" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="-1" dy="-13"/>
      <feGaussianBlur stdDeviation="4"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.647059 0 0 0 0 0.490196 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect2_innerShadow_9_558"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="-2" dy="5"/>
      <feGaussianBlur stdDeviation="6.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.316667 0 0 0 0 0.174921 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_9_558" result="effect3_innerShadow_9_558"/>
    </filter>
  </defs>
</svg>
`;
  return <SvgXml xml={xml} width={width} height={height} {...props} />;
};

export default ShieldIcon;
