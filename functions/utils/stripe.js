const Stripe = require("stripe")

const options = {
    maxNetworkRetries: 2,
}

const stripe = Stripe(process.env.STRIPE_SK_TEST, options)

module.exports = stripe
