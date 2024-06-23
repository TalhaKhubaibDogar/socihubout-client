import Stripe from 'stripe'
import { NextResponse, NextRequest } from 'next/server'

const stripe = new Stripe(
  'sk_test_51PL3WMJb1sAPkT8oc4aGMlOkcCJlQzEekEdzaaGyZFZIcteHnZseXZN6ZzWwqOVZCBSGz71ssOJoX80ZzFCTemsD00o4ITbASs'
)

export async function GET(req) {
  try {
    const checkoutSessions = await stripe.checkout.sessions.list({
      limit: 10000,
    })

    let filteredSessions = []
    let totalDonations = 0

    for (const session of checkoutSessions.data) {
      if (session?.payment_status == 'paid') {
        if (session.metadata && session.metadata.donation_id === 'Candy_01') {
          filteredSessions.push(session)
          totalDonations += session.amount_total
        }
      }
    }
    return NextResponse.json({
      filteredSessions: filteredSessions,
      totalDonations: totalDonations,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}
