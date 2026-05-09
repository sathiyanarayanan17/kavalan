import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "KAVALAN | Forensic Intelligence System",
	description:
		"AI-Powered Forensic Triage & Postmortem Intelligence System — advanced case management, autopsy analysis, time-of-death estimation, and digital evidence correlation.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body style={{ background: "var(--bg)" }}>
				<div className="flex flex-col min-h-screen">{children}</div>
			</body>
		</html>
	);
}
