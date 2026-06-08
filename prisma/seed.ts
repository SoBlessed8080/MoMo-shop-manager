import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  const passwordHash = await bcrypt.hash("password123", 12)

  const agent = await prisma.user.upsert({
    where: { email: "demo@momoshop.gh" },
    update: {},
    create: {
      email: "demo@momoshop.gh",
      name: "Kwame Asante",
      passwordHash,
      settings: {
        create: {
          shopName: "Kwame MoMo Shop",
          defaultStartingFloat: 1000,
          commissionRate: 0.01,
        },
      },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailySetting.upsert({
    where: { userId_date: { userId: agent.id, date: today } },
    update: {},
    create: {
      userId: agent.id,
      date: today,
      startingFloat: 1000,
      actualCash: null,
    },
  })

  const existingCount = await prisma.transaction.count({ where: { userId: agent.id } })

  if (existingCount === 0) {
    const now = new Date()
    const transactions = [
      { type: "CASH_IN",  amount: 200, commission: 2.0,  phoneNumber: "0244112233", note: "MTN deposit" },
      { type: "CASH_OUT", amount: 150, commission: 1.5,  phoneNumber: "0277334455", note: "Vodafone withdrawal" },
      { type: "CASH_IN",  amount: 500, commission: 5.0,  phoneNumber: "0200556677", note: "Large deposit" },
      { type: "CASH_OUT", amount: 80,  commission: 0.8,  phoneNumber: "0244889900", note: "Small withdrawal" },
      { type: "CASH_IN",  amount: 300, commission: 3.0,  phoneNumber: "0550112233", note: "AirtelTigo deposit" },
    ]

    for (let i = 0; i < transactions.length; i++) {
      const createdAt = new Date(now.getTime() - (transactions.length - i) * 25 * 60 * 1000)
      await prisma.transaction.create({
        data: { ...transactions[i], userId: agent.id, createdAt },
      })
    }
  }

  console.log("✅ Seeded successfully!")
  console.log("   Demo account: demo@momoshop.gh / password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
