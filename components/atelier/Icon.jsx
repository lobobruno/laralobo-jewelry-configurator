import { icons } from "@/lib/icons"
// Trusted static SVG paths, never user content.
export default function Icon({ name }) {
	return (
		<span
			aria-hidden="true"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: icons are static SVG markup from lib/icons, never user content
			dangerouslySetInnerHTML={{ __html: icons[name] || "" }}
		/>
	)
}
