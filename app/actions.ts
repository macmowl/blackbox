'use server'

import { initialize } from "next/dist/server/lib/render-server"
import { Cell, GridWithLasers } from "./types"
import { initializeGrid } from "@/lib/utils"

export async function saveGameState(grid: GridWithLasers) {
    console.log('Saving game state: ', grid)
}

export async function loadGameState(): Promise<GridWithLasers> {
    console.log('Loading game state')
    return initializeGrid()
}