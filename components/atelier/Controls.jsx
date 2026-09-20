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
			<div className="grid grid-cols-3 gap-[7px]">
				{Object.entries(metals).map(([id, metal]) => (
					<Choice
						key={id}
						variant="flex flex-col items-center gap-2 rounded-sm border border-transparent px-px pt-[9px] pb-[7px] text-[13px] aria-pressed:border-[#b8bcae] aria-pressed:bg-[#f0f0e9] [&[aria-pressed=true]_i]:outline [&[aria-pressed=true]_i]:outline-[#6f795c] [&[aria-pressed=true]_i]:outline-offset-[3px] max-[1050px]:text-[12px]"
						field="metal"
						value={id}
						state={state}
						choose={choose}
					>
						<i
							className={`inline-block size-7 rounded-full shadow-[inset_0_0_0_1px_#00000018,0_2px_3px_#0000000c] ${metal.swatchClass}`}
						/>
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
			<div className="flex flex-wrap gap-[7px]">
				{Object.entries(cuts).map(([id, label]) => (
					<Choice
						key={id}
						variant="flex min-w-10 flex-1 flex-col items-center gap-[7px] rounded-sm border border-transparent px-px pt-[7px] pb-1.5 text-[12px] text-[#6b7464] aria-pressed:border-[#a6ae96] aria-pressed:bg-[#f0f1ea] [&_svg]:size-7 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[.8] max-[760px]:[&_svg]:size-8"
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
			<div className="flex items-center gap-2">
				{Object.entries(stones).map(([id, stone]) => (
					<Choice
						key={id}
						variant="size-[35px] rounded-full border border-transparent p-1 aria-pressed:border-[#62734b] [&_i]:block [&_i]:size-[25px] [&_i]:rounded-full [&_i]:border [&_i]:border-[#0002]"
						field="stone"
						value={id}
						name={stone.name}
						state={state}
						choose={choose}
					>
						<i className={stone.swatchClass} />
					</Choice>
				))}
			</div>
			<p className="mt-2.5 mb-0 text-[#666f5c] text-[12px]">
				{stones[state.stone].name}
			</p>
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
				className="mt-2"
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
		<section className="border-line border-b py-4 max-[760px]:py-[19px] min-[1450px]:py-[18px]">
			<div className="mb-3 flex items-center justify-between font-medium text-[14px] [&>small]:font-normal [&>small]:text-[#838677] [&>small]:text-[11px] [&>span:first-child]:flex [&>span:first-child]:gap-2.5">
				<span>
					<span className="pt-0.5 text-[#a3a693] text-[11px]">
						{String(step).padStart(2, "0")}
					</span>
					{label}
				</span>
				{extra && <small>{extra}</small>}
			</div>
			{children}
		</section>
	)
}

/** A row of plain text buttons, one per entry of an `{ value: label }` record. */
function OptionRow({ field, options, state, choose, className = "" }) {
	return (
		<div className={`flex flex-wrap gap-[7px] ${className}`}>
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
 * One selectable value of `field`. `variant` contains the Tailwind utilities that style it;
 * `name` labels buttons whose content is purely visual, such as the stone dots.
 */
function Choice({
	variant = "min-h-[39px] flex-1 rounded-sm border border-[#dfe1d6] bg-[#ffffff88] px-[13px] py-2.5 text-[13px] whitespace-nowrap aria-pressed:border-[#626e55] aria-pressed:bg-[#ebeee5] aria-pressed:text-[#34402d] aria-pressed:shadow-[inset_0_0_0_.5px_#626e55]",
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
			className={variant}
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
			<div className="mb-[5px] flex justify-between gap-2.5 [&_small]:text-[#878a7b] [&_small]:text-[11px] [&_strong]:font-medium [&_strong]:text-[14px]">
				<strong>{readout}</strong>
				{note && <small>{note}</small>}
			</div>
			<input
				type="range"
				className="h-[18px] w-full cursor-pointer accent-[#556342]"
				min={min}
				max={max}
				step={1}
				value={value}
				aria-label={ariaLabel}
				aria-valuetext={ariaValueText}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
			<div className="flex justify-between text-[#8b8d82] text-[10px]">
				{ticks.map((tick) => (
					<span key={tick}>{tick}</span>
				))}
			</div>
		</>
	)
}
