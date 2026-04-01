import { NextResponse } from "next/server"
import { fetchLiveRates, getCurrentRates, getRateInfo } from "@/lib/currency"

export async function GET() {
  console.log("🧪 Testing exchange rate API...")

  try {
    // Attempt to fetch live rates
    const freshRates = await fetchLiveRates()
    const currentRates = getCurrentRates()
    const rateInfo = getRateInfo()

    console.log("✅ Exchange rate test successful!")

    return NextResponse.json({
      success: true,
      message: "Exchange rate API is working!",
      freshRates,
      currentRates,
      rateInfo,
      testConversions: {
        "100 USD to GBP": `$100 = £${(100 * freshRates.USD_TO_GBP).toFixed(2)}`,
        "100 GBP to USD": `£100 = $${(100 * freshRates.GBP_TO_USD).toFixed(2)}`,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Exchange rate test failed:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      fallbackRates: getCurrentRates(),
    }, { status: 500 })
  }
}
