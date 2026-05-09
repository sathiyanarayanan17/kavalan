// Type shim for Node 22+ built-in node:sqlite (experimental, no @types package yet)
declare module "node:sqlite" {
	export class DatabaseSync {
		constructor(path: string, options?: { open?: boolean });
		exec(sql: string): void;
		prepare(sql: string): StatementSync;
		close(): void;
	}

	export class StatementSync {
		run(...params: unknown[]): {
			changes: number;
			lastInsertRowid: number | bigint;
		};
		get(...params: unknown[]): Record<string, unknown> | undefined;
		all(...params: unknown[]): Record<string, unknown>[];
	}
}
