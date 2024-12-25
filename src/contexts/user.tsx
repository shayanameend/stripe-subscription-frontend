"use client";

import type { PropsWithChildren } from "react";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface User {
	id: string;
	email: string;
	role: "USER" | "ADMIN";
	tier: "FREE" | "PRO" | "PREMIUM";
	totalStorage: number;
	usedStorage: number;
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
	const localToken =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NmFhZGQ5NDFmYjllZDllZWUyZjkzNCIsImVtYWlsIjoiZnJlZTFAeW9wbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsInRpZXIiOiJGUkVFIiwidG90YWxTdG9yYWdlIjoyNjg0MzU0NTYwMCwidXNlZFN0b3JhZ2UiOjAsImlzVmVyaWZpZWQiOnRydWUsInVwZGF0ZWRBdCI6IjIwMjQtMTItMjRUMTI6NTA6NTYuNzQyWiIsImlhdCI6MTczNTEyMDczOSwiZXhwIjoxNzM1MjA3MTM5fQ.9mjCJq6BCP7wn5L9-htvG8PFDqORuwo6QLcSDVRZSyc";

	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			const response = await axios.post(
				"http://localhost:8080/auth/refresh",
				{},
				{
					headers: {
						authorization: `Bearer ${localToken}`,
					},
				},
			);

			setUser(response.data.data.user);
			setToken(response.data.data.token);
		})();
	}, []);

	return (
		<UserContext.Provider
			value={{
				user: {
					...user,
					totalStorage: formatFileSize(user?.totalStorage || 0),
					usedStorage: formatFileSize(user?.usedStorage || 0),
				},
				token,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}
