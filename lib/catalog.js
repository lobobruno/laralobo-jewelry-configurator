export const families = {
	ring: {
		name: "Solitários",
		label: "ANEL SOLITÁRIO",
		models: { classic: "Clássico", duo: "DuoGold" },
		photo: "ring",
	},
	band: {
		name: "Alianças",
		label: "ALIANÇA",
		models: { half: "Meia aliança", eternity: "Inteira", plain: "Ouro liso" },
		photo: "band",
	},
	earring: {
		name: "Brincos & piercings",
		label: "BRINCOS & PIERCINGS",
		models: {
			stud: "Ponto de luz",
			halo: "Com contorno",
			piercing: "Piercing",
		},
		photo: "earring",
	},
	riviera: {
		name: "Rivieras",
		label: "RIVIERA",
		models: { classic: "Clássica", graduated: "Degradê", rainbow: "Rainbow" },
		photo: "riviera",
	},
}
export const cuts = {
	round: "Round",
	oval: "Oval",
	pear: "Gota",
	emerald: "Emerald",
	princess: "Princess",
	heart: "Coração",
}
export const metals = {
	yellow: {
		label: "Ouro amarelo",
		color: "#e6bc70",
		swatchClass:
			"bg-[linear-gradient(130deg,#9f7632,#f2dda1_40%,#b89048_78%,#ead29b)]",
	},
	white: {
		label: "Ouro branco",
		color: "#e5e7ed",
		swatchClass:
			"bg-[linear-gradient(130deg,#8c9298,#fff_40%,#a5adb2_78%,#e5e9ed)]",
	},
	duo: {
		label: "Duo",
		color: "#e6bc70",
		swatchClass:
			"bg-[linear-gradient(130deg,#d1a557_48%,#f4f5f7_49%,#a7afb4_80%)]",
	},
}
export const stones = {
	diamond: {
		name: "Diamante branco",
		color: "#e9f5ff",
		swatchClass: "bg-[linear-gradient(135deg,#c1ced2,#fff_45%,#a3b7be)]",
	},
	emerald: {
		name: "Esmeralda Colombiana",
		color: "#169c6a",
		swatchClass: "bg-[#179a70]",
	},
	paraiba: {
		name: "Turmalina Paraíba",
		color: "#26d8d5",
		swatchClass: "bg-[#3cc5c6]",
	},
	pink: {
		name: "Turmalina Rosa",
		color: "#ed729e",
		swatchClass: "bg-[#dc86a6]",
	},
	sapphire: {
		name: "Safira azul",
		color: "#395cca",
		swatchClass: "bg-[#4961a2]",
	},
	yellow: {
		name: "Diamante Yellow",
		color: "#edcf52",
		swatchClass: "bg-[#d2b052]",
	},
}
export const initial = {
	family: "ring",
	model: "classic",
	metal: "yellow",
	stone: "diamond",
	cut: "oval",
	carat: 1,
	halo: "none",
	bandStyle: "plain",
	width: 4,
	finish: "polished",
}
export const carats = [0.3, 0.5, 0.7, 1, 1.5, 2, 3]
export const formatCt = (n) =>
	`${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ct`
export function summary(state) {
	const plain = state.family === "band" && state.model === "plain"
	const parts = [
		families[state.family].models[state.model],
		`${metals[state.metal].label} 18k`,
	]
	if (plain)
		parts.push(
			`${state.width} mm`,
			state.finish === "matte" ? "Acetinado" : "Polido",
		)
	else
		parts.push(
			cuts[state.cut],
			state.model === "rainbow" ? "Pedras coloridas" : stones[state.stone].name,
			formatCt(state.carat),
		)
	if (state.family === "ring" && state.halo !== "none")
		parts.push(state.halo === "single" ? "Ilusion" : "Duplo contorno")
	if (state.family === "ring" && state.bandStyle === "pave")
		parts.push("Aro cravejado")
	return parts.join(" · ")
}
