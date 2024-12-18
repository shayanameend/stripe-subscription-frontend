"use client";

import { type Stripe, loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
	const token =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWZhNDg2NzMzMjRkZGFjYzRmNWQ4MiIsImVtYWlsIjoiYUB5b3BtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwidGllciI6IkZSRUUiLCJyZW1haW5pbmdTdG9yYWdlIjoyNjg0MzU0NTYwMCwiaXNWZXJpZmllZCI6dHJ1ZSwidXBkYXRlZEF0IjoiMjAyNC0xMi0xNlQwMzo1NDo0Ni40ODdaIiwiaWF0IjoxNzM0MzIxMzAzLCJleHAiOjE3MzQ5MjYxMDN9.SkIlwKrjtK9nyuyeOnYK8QVrevk4-bf2Jo-iemhLc_k";

	const [stripe, setStripe] = useState<Stripe | null>(null);

	useEffect(() => {
		(async () => {
			if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
				throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
			}

			const stripeInstance = await loadStripe(
				process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
			);
			setStripe(stripeInstance);
		})();
	}, []);

	const subscribeClickHandler = async (tier: "PRO" | "PREMIUM") => {
		if (!stripe) {
			console.error("Stripe not initialized");
			return;
		}

		try {
			const response = await axios.post(
				`http://localhost:8080/subscriptions/checkout?tier=${tier}`,
				{},
				{
					headers: {
						authorization: `Bearer ${token}`,
					},
				},
			);

			const sessionId = response.data.data.sessionId;

			console.log("Redirecting to checkout:", sessionId);

			const { error } = await stripe.redirectToCheckout({ sessionId });

			if (error) {
				console.error("Stripe Checkout Error:", error.message);
			}
		} catch (error) {
			console.error("Failed to create checkout session:", error);
		}
	};

	const portalClickHandler = async () => {
		try {
			const response = await axios.post(
				"http://localhost:8080/subscriptions/portal",
				{},
				{
					headers: {
						authorization: `Bearer ${token}`,
					},
				},
			);

			const portalUrl = response.data.data.url;

			console.log("Redirecting to portal:", portalUrl);

			window.location.href = portalUrl;
		} catch (error) {
			console.error("Failed to create portal session:", error);
		}
	};

	return (
		<main className="h-screen flex justify-center items-center">
			<section>
				<h2>Stripe Subscriptions</h2>
				<article>
					<h3>Pro Plan</h3>
					<div className="flex justify-between">
						<button
							type="button"
							onClick={() => {
								subscribeClickHandler("PRO");
							}}
						>
							Subscribe
						</button>
						<button
							type="button"
							onClick={() => {
								portalClickHandler();
							}}
						>
							Portal
						</button>
					</div>
				</article>
				<article>
					<h3>Premium Plan</h3>
					<div className="flex justify-between">
						<button
							type="button"
							onClick={() => {
								subscribeClickHandler("PREMIUM");
							}}
						>
							Subscribe
						</button>
						<button
							type="button"
							onClick={() => {
								portalClickHandler();
							}}
						>
							Portal
						</button>
					</div>
				</article>
			</section>
		</main>
	);
}
