// Summoner's Rift regions - More precise geometric paths based on 512x512 minimap
// Tracing actual lanes, jungle camps, and river from the official map
export const summonersRiftRegions = {
  "topLane": {
    "path": "M 60 130 L 130 70 L 180 65 L 230 85 L 250 120 L 240 160 L 210 180 L 170 185 L 120 175 L 80 155 Z",
    "centroid": { "x": 165, "y": 130 }
  },
  "midLane": {
    "path": "M 120 175 L 170 185 L 215 210 L 255 245 L 285 285 L 305 330 L 295 365 L 265 385 L 220 380 L 180 355 L 145 320 L 115 280 L 95 235 L 100 195 Z",
    "centroid": { "x": 200, "y": 280 }
  },
  "botLane": {
    "path": "M 265 385 L 295 365 L 330 365 L 365 380 L 390 410 L 390 440 L 370 455 L 335 455 L 300 440 L 275 415 Z",
    "centroid": { "x": 330, "y": 410 }
  },
  "blueJungleTop": {
    "path": "M 40 150 L 80 155 L 100 195 L 95 235 L 80 270 L 55 285 L 30 270 L 20 235 L 25 190 L 35 165 Z",
    "centroid": { "x": 60, "y": 220 }
  },
  "blueJungleBot": {
    "path": "M 55 285 L 80 270 L 115 280 L 135 310 L 135 345 L 120 375 L 90 390 L 60 385 L 40 360 L 35 325 L 40 300 Z",
    "centroid": { "x": 85, "y": 335 }
  },
  "redJungleTop": {
    "path": "M 240 160 L 265 145 L 300 145 L 335 160 L 360 185 L 375 220 L 375 255 L 360 280 L 330 295 L 295 295 L 265 280 L 245 255 L 235 220 L 235 185 Z",
    "centroid": { "x": 305, "y": 220 }
  },
  "redJungleBot": {
    "path": "M 295 295 L 330 295 L 355 310 L 375 335 L 385 365 L 380 395 L 365 410 L 330 415 L 305 405 L 285 380 L 275 350 L 275 320 L 285 305 Z",
    "centroid": { "x": 330, "y": 355 }
  },
  "riverUpper": {
    "path": "M 100 195 L 120 175 L 170 185 L 210 180 L 240 160 L 265 145 L 265 180 L 245 210 L 215 235 L 180 245 L 145 240 L 115 225 L 95 210 Z",
    "centroid": { "x": 180, "y": 200 }
  },
  "riverLower": {
    "path": "M 180 355 L 220 380 L 265 385 L 295 365 L 305 330 L 295 295 L 265 280 L 235 285 L 210 305 L 185 330 L 165 345 L 155 350 Z",
    "centroid": { "x": 240, "y": 335 }
  },
  "baronPit": {
    "path": "M 215 145 L 245 135 L 270 145 L 280 165 L 275 185 L 250 200 L 220 198 L 200 180 L 200 160 Z",
    "centroid": { "x": 240, "y": 170 }
  },
  "dragonPit": {
    "path": "M 200 330 L 220 320 L 245 325 L 260 340 L 260 360 L 245 375 L 220 378 L 200 368 L 190 350 Z",
    "centroid": { "x": 230, "y": 350 }
  },
  "blueBase": {
    "path": "M 0 410 L 40 390 L 70 400 L 85 425 L 80 455 L 55 475 L 20 480 L 0 470 Z",
    "centroid": { "x": 45, "y": 440 }
  },
  "redBase": {
    "path": "M 420 0 L 445 15 L 470 40 L 485 70 L 490 100 L 485 125 L 465 110 L 445 90 L 425 65 L 410 35 L 405 10 Z",
    "centroid": { "x": 455, "y": 70 }
  }
};
