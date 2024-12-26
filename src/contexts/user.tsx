"use client";

import type { PropsWithChildren } from "react";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export type Role = "USER" | "ADMIN";

export type Tier = "FREE" | "PRO" | "PREMIUM";

export interface User {
	id: string;
	email: string;
	role: Role;
	tier: Tier;
	totalStorage: string;
	usedStorage: string;
	isVerified: boolean;
	updatedAt: Date;
}

export const UserContext = createContext<{
	user: User | null;
	token: string | null;
}>({
	user: null,
	token: null,
});

export const useUserContext = () => {
	return useContext(UserContext);
};

const formatFileSize = (sizeInBytes: number) => {
	if (sizeInBytes === -1) {
		return "Unlimited";
	}

	if (sizeInBytes < 1024) {
		return `${sizeInBytes} Bytes`;
	}

	if (sizeInBytes < 1024 * 1024) {
		return `${(sizeInBytes / 1024).toFixed(2)} KB`;
	}

	if (sizeInBytes < 1024 * 1024 * 1024) {
		return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	if (sizeInBytes < 1024 * 1024 * 1024 * 1024) {
		return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	}

	return `${(sizeInBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
};

export function UserProvider({ children }: Readonly<PropsWithChildren>) {
	const router = useRouter();

	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const localToken = localStorage.getItem("token");

		if (localToken) {
			(async () => {
				try {
					const response = await axios.post(
						"http://localhost:8080/auth/refresh",
						{},
						{
							headers: {
								authorization: `Bearer ${localToken}`,
							},
						},
					);

					setUser({
						id: response.data.data.user.id,
						email: response.data.data.user.email,
						role: response.data.data.user.role,
						tier: response.data.data.user.tier,
						totalStorage: formatFileSize(response.data.data.user.totalStorage),
						usedStorage: formatFileSize(response.data.data.user.usedStorage),
						isVerified: response.data.data.user.isVerified,
						updatedAt: new Date(response.data.data.user.updatedAt),
					});
					setToken(response.data.data.token);

					localStorage.setItem("token", response.data.data.token);
				} catch (error) {
					if (error instanceof AxiosError) {
						if (error.response?.status === 401) {
							localStorage.removeItem("token");

							setUser(null);
							setToken(null);

							return router.push("/login");
						}
					}
				}
			})();
		}
	}, [router.push]);

	return (
		<UserContext.Provider
			value={{
				user,
				token,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}
