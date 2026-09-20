import { icons } from '@/lib/icons';
// Trusted static SVG paths, never user content.
export default function Icon({ name }) { return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[name] || '' }}/>; }
