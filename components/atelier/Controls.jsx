import { cloneElement } from "react"
import { carats, cuts, families, formatCt, metals, stones } from "@/lib/catalog"
import Icon from "./Icon"

const HALOS = { none: "Sem contorno", single: "Ilusion", double: "Duplo" }
const BAND_STYLES = { plain: "Aro liso", pave: "Aro cravejado" }
const FINISHES = { polished: "Polido", matte: "Acetinado" }
const WIDTH_MM = { min: 3, max: 7 }
const CARAT_TICKS = [
	carats[0],
	carats[Math.floor(carats.length / 2)],
	carats.at(-1),
].map(formatCt)

/**
 * The configuration panel beside the 3D viewer.
 *
 * Every section takes the current `state` and the `choose(field, value)` callback
 * that Atelier uses to update it. Step numbers ("01", "02"…) are derived from the
 * order the sections are listed in, so hiding or reordering one never leaves a gap.
 */
export default function Controls({ state, choose }) {
	return (
		<div id="config-controls">
			{visibleSections(state, choose).map((section, index) =>
				cloneElement(section, { step: index + 1 }),
			)}
		</div>
	)
}

function visibleSections(state, choose) {
	const props = { state, choose }
	// A plain gold band carries no stone: it is sized by width and finish instead.
	const isPlainBand = state.family === "band" && state.model === "plain"
	return [
		<ModelSection key="model" {...props} />,
		<MetalSection key="metal" {...props} />,
		...(isPlainBand
			? [
					<WidthSection key="width" {...props} />,
					<FinishSection key="finish" {...props} />,
				]
			: [
					<CutSection key="cut" {...props} />,
					// Rainbow pieces use the whole stone palette, so there is nothing to pick.
					state.model !== "rainbow" && <StoneSection key="stone" {...props} />,
					<CaratSection key="carat" {...props} />,
					state.family === "ring" && (
						<DetailsSection key="details" {...props} />
					),
				]),
	].filter(Boolean)
}

/* --- Sections ----------------------------------------------------------- */

function ModelSection({ step, state, choose }) {
	return (
		<Section step={step} label="O modelo">
			<OptionRow
				field="model"
				options={families[state.family].models}
				state={state}
				choose={choose}
			/>
		</Section>
	)
}

function MetalSection({ step, state, choose }) {
	return (
		<Section step={step} label="O metal" extra="18k">
			<div className="metal-options">
				{Object.entries(metals).map(([id, metal]) => (
					<Choice
						key={id}
						variant="metal-option"
						field="metal"
						value={id}
						state={state}
						choose={choose}
					>
						<i className="swatch" style={{ background: metal.css }} />
						{metal.label}
					</Choice>
				))}
			</div>
		</Section>
	)
}

function CutSection({ step, state, choose }) {
	return (
		<Section step={step} label="A lapidação">
			<div className="options">
				{Object.entries(cuts).map(([id, label]) => (
					<Choice
						key={id}
						variant="shape-option"
						field="cut"
						value={id}
						state={state}
						choose={choose}
					>
						<Icon name={id} />
						{label}
					</Choice>
				))}
			</div>
		</Section>
	)
}

function StoneSection({ step, state, choose }) {
	return (
		<Section step={step} label="A pedra">
			<div className="stone-selector">
				{Object.entries(stones).map(([id, stone]) => (
					<Choice
						key={id}
						variant="stone-dot"
						field="stone"
						value={id}
						name={stone.name}
						state={state}
						choose={choose}
					>
						<i style={{ background: stone.swatch }} />
					</Choice>
				))}
			</div>
			<p className="stone-name">{stones[state.stone].name}</p>
		</Section>
	)
}

function CaratSection({ step, state, choose }) {
	const carat = formatCt(state.carat)
	return (
		<Section
			step={step}
			label={
				state.family === "ring" ? "O tamanho da pedra" : "O tamanho das pedras"
			}
		>
			{/* The slider walks the discrete `carats` list, so its value is an index. */}
			<Slider
				readout={carat}
				note="Escala visual aproximada"
				value={carats.indexOf(state.carat)}
				min={0}
				max={carats.length - 1}
				ticks={CARAT_TICKS}
				ariaLabel="Tamanho da pedra em quilates"
				ariaValueText={carat}
				onChange={(index) => choose("carat", carats[index])}
			/>
		</Section>
	)
}

function DetailsSection({ step, state, choose }) {
	return (
		<Section step={step} label="Os detalhes">
			<OptionRow field="halo" options={HALOS} state={state} choose={choose} />
			<OptionRow
				field="bandStyle"
				options={BAND_STYLES}
				state={state}
				choose={choose}
				style={{ marginTop: 8 }}
			/>
		</Section>
	)
}

function WidthSection({ step, state, choose }) {
	return (
		<Section step={step} label="A largura">
			<Slider
				readout={`${state.width} mm`}
				value={state.width}
				min={WIDTH_MM.min}
				max={WIDTH_MM.max}
				ticks={[`${WIDTH_MM.min} mm`, `${WIDTH_MM.max} mm`]}
				ariaLabel="Largura da aliança em milímetros"
				onChange={(width) => choose("width", width)}
			/>
		</Section>
	)
}

function FinishSection({ step, state, choose }) {
	return (
		<Section step={step} label="O acabamento">
			<OptionRow
				field="finish"
				options={FINISHES}
				state={state}
				choose={choose}
			/>
		</Section>
	)
}

/* --- Building blocks ---------------------------------------------------- */

function Section({ step, label, extra, children }) {
	return (
		<section className="control-section">
			<div className="section-label">
				<span>
					<span className="step">{String(step).padStart(2, "0")}</span>
					{label}
				</span>
				{extra && <small>{extra}</small>}
			</div>
			{children}
		</section>
	)
}

/** A row of plain text buttons, one per entry of an `{ value: label }` record. */
function OptionRow({ field, options, state, choose, style }) {
	return (
		<div className="options" style={style}>
			{Object.entries(options).map(([value, label]) => (
				<Choice
					key={value}
					field={field}
					value={value}
					state={state}
					choose={choose}
				>
					{label}
				</Choice>
			))}
		</div>
	)
}

/**
 * One selectable value of `field`. `variant` is the CSS class that styles it;
 * `name` labels buttons whose content is purely visual, such as the stone dots.
 */
function Choice({
	variant = "option",
	field,
	value,
	state,
	choose,
	name,
	children,
}) {
	const active = state[field] === value
	return (
		<button
			type="button"
			className={active ? `${variant} active` : variant}
			aria-pressed={active}
			aria-label={name}
			title={name}
			onClick={() => choose(field, value)}
		>
			{children}
		</button>
	)
}

/** Discrete slider: `readout` is what the customer reads, `value` where the thumb sits. */
function Slider({
	readout,
	note,
	value,
	min,
	max,
	ticks,
	ariaLabel,
	ariaValueText,
	onChange,
}) {
	return (
		<>
			<div className="size-line">
				<strong>{readout}</strong>
				{note && <small>{note}</small>}
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={1}
				value={value}
				aria-label={ariaLabel}
				aria-valuetext={ariaValueText}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
			<div className="range-labels">
				{ticks.map((tick) => (
					<span key={tick}>{tick}</span>
				))}
			</div>
		</>
	)
}
