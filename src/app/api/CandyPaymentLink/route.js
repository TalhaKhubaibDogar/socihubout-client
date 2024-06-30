import Stripe from 'stripe'
import { NextResponse, NextRequest } from 'next/server'

const stripe = new Stripe(
  'sk_test_51PL3WMJb1sAPkT8oc4aGMlOkcCJlQzEekEdzaaGyZFZIcteHnZseXZN6ZzWwqOVZCBSGz71ssOJoX80ZzFCTemsD00o4ITbASs'
)

export async function POST(req) {
  try {
    const price = await req.json()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation',
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://socihubout.site/paymentSuccess',
      cancel_url: 'http://socihubout.site/',
      metadata: {
        donation_id: 'Candy_01',
      },
    })

    return NextResponse.json({ url: session })
  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}
