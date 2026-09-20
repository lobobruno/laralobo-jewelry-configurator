"use client"
import { createContext, useContext, useState } from "react"
import { initial } from "@/lib/catalog"

const ConfigurationContext = createContext(null)
export function ConfigurationProvider({ children }) {
	const value = useState(initial)
	return (
		<ConfigurationContext.Provider value={value}>
			{children}
		</ConfigurationContext.Provider>
	)
}
export function useConfiguration() {
	return useContext(ConfigurationContext)
}
