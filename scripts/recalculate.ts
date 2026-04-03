import { PrismaClient } from "@prisma/client"
import { calculateEarning } from "../src/lib/earnings-calculator"
import type { Currency } from "../src/lib/currency"

const prisma = new PrismaClient()

async function recalculate() {
  console.log("🔄 Starting recalculation of all earnings...")
  console.log("=" .repeat(50))

  try {
    const earnings = await prisma.earning.findMany({
      orderBy: { createdAt: "asc" }
    })

    console.log(`📊 Found ${earnings.length} earnings to recalculate\n`)

    let updated = 0
    let errors = 0
    let changes = 0

    for (const earning of earnings) {
      try {
        // Calculate with new logic
        const calculated = calculateEarning({
          reward: earning.reward,
          rewardCurrency: earning.rewardCurrency as Currency,
          bonus: earning.bonus,
          bonusCurrency: earning.bonusCurrency as Currency | null,
          startedAt: earning.startedAt,
          completedAt: earning.completedAt,
          status: earning.status,
        })

        // Check if values changed
        const gbpChanged = Math.abs(calculated.normalizedGBP - (earning.normalizedGBP || 0)) > 0.01
        const usdChanged = Math.abs(calculated.normalizedUSD - (earning.normalizedUSD || 0)) > 0.01

        if (gbpChanged || usdChanged) {
          changes++
          console.log(`\n🔧 Updating: ${earning.studyTitle}`)
          console.log(`   Status: ${earning.status}`)
          console.log(`   Old GBP: £${(earning.normalizedGBP || 0).toFixed(2)} → New: £${calculated.normalizedGBP.toFixed(2)}`)
          console.log(`   Old USD: $${(earning.normalizedUSD || 0).toFixed(2)} → New: $${calculated.normalizedUSD.toFixed(2)}`)
        }

        // Update database
        await prisma.earning.update({
          where: { id: earning.id },
          data: {
            totalEarning: calculated.totalEarning,
            normalizedGBP: calculated.normalizedGBP,
            normalizedUSD: calculated.normalizedUSD,
            hourlyRate: calculated.hourlyRate,
          },
        })

        updated++

        // Progress indicator
        if (updated % 20 === 0) {
          console.log(`\n⏳ Progress: ${updated}/${earnings.length} (${((updated/earnings.length)*100).toFixed(1)}%)`)
        }

      } catch (error) {
        errors++
        console.error(`❌ Error updating earning ${earning.id}:`, error)
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log("✅ RECALCULATION COMPLETE!")
    console.log(`   Total processed: ${updated}`)
    console.log(`   Values changed: ${changes}`)
    console.log(`   Errors: ${errors}`)
    console.log("=".repeat(50))

  } catch (error) {
    console.error("\n❌ Fatal error:", error)
    process.exit(1)
  }
}

recalculate()
  .catch((error) => {
    console.error("❌ Script failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log("\n👋 Database disconnected")
  })
