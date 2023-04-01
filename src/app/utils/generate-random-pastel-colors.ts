type HexColor = `#${string}`

export function generateRandomPastelColors(): { bgColor: HexColor; textColor: HexColor } {
  const bgColor = generatePastelColor()
  const textColor = generateReadableTextColor(bgColor)

  return { bgColor, textColor }
}

function generatePastelColor(): HexColor {
  // Define the minimum and maximum values for the red, green, and blue components
  const min = 100
  const max = 200

  // Generate random values for the red, green, and blue components within the specified range
  const r = Math.floor(Math.random() * (max - min + 1)) + min
  const g = Math.floor(Math.random() * (max - min + 1)) + min
  const b = Math.floor(Math.random() * (max - min + 1)) + min

  // Convert the RGB values to a hexadecimal string
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` satisfies HexColor

  return hex
}

function generateReadableTextColor(bgColor: string): HexColor {
  // Define the light and dark color thresholds
  const lightThreshold = 0.5 // Colors with a luminance > 0.5 are considered light
  const darkThreshold = 1.5 // Colors with a luminance < 0.2 are considered dark

  // Calculate the relative luminance of the background color
  const rgb = hexToRgb(bgColor)
  const luminance = calculateRelativeLuminance(rgb)

  // Choose the light or dark text color based on the luminance of the background color
  if (luminance > lightThreshold) {
    return '#000000' // Black text for light backgrounds
  } else if (luminance < darkThreshold) {
    return '#FFFFFF' // White text for dark backgrounds
  } else {
    return '#333333' // Dark gray text for mid-range backgrounds
  }
}

// Helper function to convert a hexadecimal color string to an RGB array
function hexToRgb(hex: string): number[] {
  const r = parseInt(hex.substring(1, 2), 16)
  const g = parseInt(hex.substring(3, 2), 16)
  const b = parseInt(hex.substring(5, 2), 16)
  return [r, g, b]
}

// Helper function to calculate the relative luminance of an RGB color
function calculateRelativeLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
