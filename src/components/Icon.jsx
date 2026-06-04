import Svg, {
  Polyline, Path, Circle, Rect, Line,
} from 'react-native-svg'

export function Icon({ name, color = 'currentColor', size = 18 }) {
  const props = {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    back:   <Polyline points="15,18 9,12 15,6" />,
    fwd:    <Polyline points="9,18 15,12 9,6" />,
    home:   <><Path d="M3 9.5L12 3l9 6.5V21H3z" /><Path d="M9 21V12h6v9" /></>,
    cal:    <><Rect x="3" y="4" width="18" height="18" rx="3" /><Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" /></>,
    bell:   <><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    user:   <><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></>,
    baby:   <><Circle cx="12" cy="8" r="5" /><Path d="M3 21a9 9 0 0 1 18 0" /></>,
    plus:   <><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></>,
    heart:  <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    check:  <Polyline points="20,6 9,17 4,12" />,
    trash:  <><Polyline points="3,6 5,6 21,6" /><Path d="M19 6l-1 14H6L5 6" /><Path d="M10 11v6" /><Path d="M14 11v6" /><Path d="M9 6V4h6v2" /></>,
    shield: <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    file:   <><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14,2 14,8 20,8" /></>,
    logout: <><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Polyline points="16,17 21,12 16,7" /><Line x1="21" y1="12" x2="9" y2="12" /></>,
    warn:   <><Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><Line x1="12" y1="9" x2="12" y2="13" /><Line x1="12" y1="17" x2="12.01" y2="17" /></>,
    edit:   <><Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    ok:     <Polyline points="20,6 9,17 4,12" />,
    clock:  <><Circle cx="12" cy="12" r="10" /><Polyline points="12,6 12,12 16,14" /></>,
    x:      <><Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" /></>,
  }

  return <Svg {...props}>{icons[name] || null}</Svg>
}
