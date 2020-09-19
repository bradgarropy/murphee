const fetch = require("node-fetch")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const handler = async (event, context) => {
    const body = JSON.parse(event.body)
    const customerId = body.data.object.customer
    const {url, token} = context.clientContext.identity

    try {
        stripe.webhooks.constructEvent(
            event.body,
            event.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET,
        )
    } catch (err) {
        return {
            statusCode: 400,
            body: `Webhook Error: ${err.message}`,
        }
    }

    if (body.type !== "checkout.session.completed") {
        return {statusCode: 200}
    }

    const customer = await stripe.customers.retrieve(customerId)

    const user = {
        email: customer.email,
        password: "foobar",
    }

    const signupResponse = await fetch(`${url}/signup`, {
        method: "POST",
        headers: {Authorization: `Bearer ${token}`},
        body: JSON.stringify(user),
    })

    console.log(signupResponse)

    // TODO: handle fetch error
    const {id} = await signupResponse.json()

    const updates = {
        app_metadata: {
            roles: ["free", "pro"],
        },
    }

    const userResponse = await fetch(`${url}/admin/users/${id}`, {
        method: "PUT",
        headers: {Authorization: `Bearer ${token}`},
        body: JSON.stringify(updates),
    })

    // TODO: handle fetch error
    await userResponse.json()

    const response = {statusCode: 200}
    return response
}

module.exports = {handler}
