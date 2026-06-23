import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Seed Rewards
    const rewardsCount = await prisma.reward.count();
    if (rewardsCount === 0) {
      await prisma.reward.createMany({
        data: [
          {
            name: "Amazon Gift Card",
            description: "₹100 Amazon voucher",
            points: 500,
            brand: "Amazon",
            icon: "🛒",
          },
          {
            name: "Swiggy ₹150 Off",
            description: "Flat ₹150 off on your next order",
            points: 400,
            brand: "Swiggy",
            icon: "🍔",
          },
          {
            name: "Domino's Coupon",
            description: "Buy 1 Get 1 Free on any pizza",
            points: 350,
            brand: "Dominos",
            icon: "🍕",
          },
          {
            name: "Zomato ₹100 Off",
            description: "₹100 off on orders above ₹299",
            points: 300,
            brand: "Zomato",
            icon: "🥘",
          },
          {
            name: "Paytm Cashback",
            description: "₹50 cashback on next recharge",
            points: 200,
            brand: "Paytm",
            icon: "💰",
          },
          {
            name: "Plant a Tree",
            description: "We plant a tree in your name",
            points: 100,
            brand: "CleanKart",
            icon: "🌳",
          },
        ],
      });
    }

    // Seed Communities
    const communitiesCount = await prisma.community.count();
    if (communitiesCount === 0) {
      await prisma.community.createMany({
        data: [
          {
            name: "Green Delhi Initiative",
            description: "Weekly cleanup drives across Delhi NCR. Join us every Sunday morning and help keep our city clean!",
            organizer: "Swachh Bharat NGO",
            email: "contact@swachhbharat.org",
            phone: "+91 98765 43210",
            location: "Delhi NCR",
            date: new Date("2026-06-22T07:00:00"),
            members: 234,
            status: "APPROVED",
          },
          {
            name: "Clean Mumbai Beach",
            description: "Monthly beach cleanup drives at Juhu and Marine Drive. Let's keep our beaches beautiful!",
            organizer: "Ocean Warriors",
            email: "hello@oceanwarriors.in",
            phone: "+91 98765 43211",
            location: "Mumbai",
            date: new Date("2026-07-05T06:00:00"),
            members: 189,
            status: "APPROVED",
          },
          {
            name: "Jaipur Heritage Clean",
            description: "Keeping Jaipur's heritage sites clean and beautiful for tourists and locals alike.",
            organizer: "Pink City Foundation",
            email: "info@pinkcity.org",
            phone: "+91 98765 43212",
            location: "Jaipur",
            date: new Date("2026-06-21T07:30:00"),
            members: 156,
            status: "APPROVED",
          },
          {
            name: "Bangalore Parks Care",
            description: "Maintaining cleanliness in Bangalore's parks and gardens every weekend.",
            organizer: "Garden City NGO",
            email: "info@gardencity.org",
            phone: "+91 98765 43213",
            location: "Bangalore",
            date: new Date("2026-06-22T08:00:00"),
            members: 312,
            status: "APPROVED",
          },
          {
            name: "Clean Ganga Mission",
            description: "Riverbank cleanup drives along the Ganga. Together we can restore our sacred river!",
            organizer: "Namami Gange",
            email: "contact@namamigange.gov.in",
            phone: "+91 98765 43214",
            location: "Varanasi",
            date: new Date("2026-07-13T06:30:00"),
            members: 428,
            status: "APPROVED",
          },
        ],
      });
    }

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}