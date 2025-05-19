import Svg, { Circle, Ellipse } from 'react-native-svg';

const Background = ({ width = 375, height = 812, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 375 812" fill="none" {...props}>
    <Circle cx="-11" cy="72" r="100" fill="#51ffc6"/>
    <Ellipse cx="73.697" cy="12.2247" rx="96.697" ry="96.2247" fill="#cdfff3" fillOpacity={0.7}/>
    <Circle cx="281" cy="800" r="100" fill="#51ffc6"/>
    <Ellipse cx="365.697" cy="740.225" rx="96.697" ry="96.2247" fill="#cdfff3" fillOpacity={0.7}/>
  </Svg>
);

export default Background;
    