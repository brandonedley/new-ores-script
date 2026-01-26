// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface LADataLayerReceiverConfig {
	allowedOrigins?: string[];
	eventPrefix?: string;
	messageType?: string;
	skipEvents?: string[];
	onEvent?: (event: { eventName: string; data: unknown; timestamp: number; url: string; sessionId: string; parentEvent: unknown }) => void;
	onError?: (error: Error) => void;
	debug?: boolean;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		LADataLayerReceiver: new (config?: LADataLayerReceiverConfig) => {
			getStats(): { eventCount: number; uptime: number; config: LADataLayerReceiverConfig };
			destroy(): void;
		};
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}

export {};
