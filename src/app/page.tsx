"use client";

import axios from "axios";

import { useUserContext } from "~/contexts/user";

export default function Home() {
	const { user, token } = useUserContext();

	const subscribeClickHandler = async (tier: "PRO" | "PREMIUM") => {
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

			const sessionUrl = response.data.data.url;

			console.log("Redirecting to checkout:", sessionUrl);

			window.location.href = sessionUrl;
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
				<p>
					User is on{" "}
					<span className="capitalize">{user?.tier?.toLowerCase()}</span> Plan
				</p>
				<p>
					Email: <span>{user?.email}</span>
				</p>
				<p>
					Total Storage:{" "}
					{user?.totalStorage && <span>{user.totalStorage}</span>}
				</p>
				<p>
					Used Storage: <span>{user?.usedStorage}</span>
				</p>
				{user?.tier !== "FREE" && (
					<article>
						<button
							type="button"
							onClick={() => {
								portalClickHandler();
							}}
						>
							Go to Portal
						</button>
					</article>
				)}
				{user?.tier === "FREE" && (
					<>
						<article>
							<h3>Pro Plan</h3>
							<div>
								<button
									type="button"
									onClick={() => {
										subscribeClickHandler("PRO");
									}}
								>
									Subscribe
								</button>
							</div>
						</article>
						<article>
							<h3>Premium Plan</h3>
							<div>
								<button
									type="button"
									onClick={() => {
										subscribeClickHandler("PREMIUM");
									}}
								>
									Subscribe
								</button>
							</div>
						</article>
					</>
				)}
			</section>
		</main>
	);
}
