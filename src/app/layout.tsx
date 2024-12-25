import type { PropsWithChildren } from "react";

import { UserProvider } from "~/contexts/user";

import "./globals.css";

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en">
			<body>
				<UserProvider>{children}</UserProvider>
			</body>
		</html>
	);
}
