const svg = (inner) =>
	`<svg viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`
export const icons = {
	ring: svg(
		'<circle cx="16" cy="20" r="9"/><path d="m11 7 2-4h6l2 4-5 6Z M11 7h10 M13 3l3 10 3-10"/>',
	),
	band: svg(
		'<ellipse cx="16" cy="17" rx="11" ry="8"/><path d="M5 17v5c1 9 21 9 22 0v-5 M7 20c4-7 14-7 18 0"/>',
	),
	earring: svg(
		'<circle cx="10" cy="8" r="3"/><circle cx="23" cy="8" r="3"/><path d="M10 11v5m13-5v5"/><path d="m10 15 5 6-5 7-5-7Z m13 0 5 6-5 7-5-7Z"/>',
	),
	riviera: svg(
		'<path d="M4 5c-5 29 29 29 24 0 M7 5c-3 25 21 25 18 0"/><path d="m7 16 3 1m2 6 1-3m5 5v-3m5-1-2-2"/>',
	),
	round: svg(
		'<circle cx="16" cy="16" r="12"/><path d="m16 4 8 4 4 8-4 8-8 4-8-4-4-8 4-8Z m0 5 7 7-7 7-7-7Z M8 8l8 1 8-1-1 8 1 8-8-1-8 1 1-8Z"/>',
	),
	oval: svg(
		'<ellipse cx="16" cy="16" rx="9" ry="13"/><path d="m16 3 6 7 3 6-3 6-6 7-6-7-3-6 3-6Z m0 5 6 8-6 8-6-8Z"/>',
	),
	pear: svg(
		'<path d="M16 2C12 8 6 15 6 21a10 10 0 0 0 20 0C26 15 20 8 16 2Z M16 2l-6 18 6 7 6-7Z M6 21l10 6 10-6"/>',
	),
	emerald: svg(
		'<path d="m10 3-4 4v18l4 4h12l4-4V7l-4-4Z m1 4-2 2v14l2 2h10l2-2V9l-2-2Z m1 4h8v10h-8Z M6 7l6 4m14-4-6 4M6 25l6-4m14 4-6-4"/>',
	),
	princess: svg(
		'<path d="M4 4h24v24H4Z m5 5h14v14H9Z M4 4l12 7L28 4l-7 12 7 12-12-7-12 7 7-12Z"/>',
	),
	heart: svg(
		'<path d="M16 8C8-4-3 11 6 19l10 10 10-10C35 11 24-4 16 8Z M16 8l-6 9 6 12 6-12Z M4 11l6 6-4 2m22-8-6 6 4 2"/>',
	),
}
