<script lang="ts">
	import { onMount } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';

	interface BridgeEvent {
		id: number;
		type: string;
		timestamp: Date;
		data?: Record<string, unknown>;
	}

	let bridgeReady = $state(false);
	let events = $state<BridgeEvent[]>([]);
	let eventId = 0;

	onMount(() => {
		// Listen for postMessage events
		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== 'https://book.mylimobiz.com') return;

			const message = event.data;
			if (!message || !message.type) return;

			if (message.type === 'LA_IFRAME_HEIGHT' || message.type === 'LA_DATALAYER_EVENT') {
				bridgeReady = true;
				events = [
					{
						id: ++eventId,
						type: message.type,
						timestamp: new Date(),
						data: message.type === 'LA_DATALAYER_EVENT' ? message.payload : { height: message.height }
					},
					...events
				].slice(0, 100); // Keep last 100 events
			}
		};

		window.addEventListener('message', handleMessage);

		// Load the bridge script AFTER the iframe exists in DOM
		const script = document.createElement('script');
		script.setAttribute('data-la-bridge', '');
		script.setAttribute('data-debug', 'true');
		script.setAttribute('data-measurement-id', 'G-ZW4QZ889NM');
		script.setAttribute('data-allowed-origins', 'https://book.mylimobiz.com');
		script.setAttribute('data-iframe-selector', 'iframe[src*="book.mylimobiz.com"]');
		script.setAttribute('data-min-height', '400');
		script.setAttribute('data-max-height', '2000');
		script.setAttribute('data-enable-height-resize', 'true');
		script.src =
			'https://mrzmqoooanbzfuffrcef.supabase.co/storage/v1/object/public/cdn/la-bridge/parent-receiver.min.js';
		document.body.appendChild(script);

		// Cleanup on unmount
		return () => {
			window.removeEventListener('message', handleMessage);
			script.remove();
		};
	});

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function getEventLabel(type: string): string {
		return type === 'LA_IFRAME_HEIGHT' ? 'Height' : 'DataLayer';
	}

	function getEventColor(type: string): string {
		return type === 'LA_IFRAME_HEIGHT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
	}
</script>

<svelte:head>
	<title>DataLayer Bridge Test</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
	<!-- Header -->
	<header class="bg-slate-800 px-4 py-3 text-white">
		<div class="mx-auto flex max-w-5xl items-center justify-between">
			<h1 class="text-lg font-semibold">DataLayer Bridge Test</h1>
			<div class="flex items-center gap-4 text-sm">
				<span class="flex items-center gap-2">
					<span
						class="inline-block h-2 w-2 rounded-full {bridgeReady
							? 'bg-green-400'
							: 'bg-yellow-400'}"
					></span>
					{bridgeReady ? 'Connected' : 'Waiting...'}
				</span>

				<Sheet.Root>
					<Sheet.Trigger>
						<Button variant="ghost" size="sm" class="text-slate-300 hover:text-white hover:bg-slate-700">
							Events: {events.length}
						</Button>
					</Sheet.Trigger>
					<Sheet.Content side="right" class="w-[400px] sm:w-[540px]">
						<Sheet.Header>
							<Sheet.Title>Bridge Events</Sheet.Title>
							<Sheet.Description>
								Showing {events.length} events from the widget iframe
							</Sheet.Description>
						</Sheet.Header>
						<ScrollArea class="h-[calc(100vh-140px)] pr-4">
							{#if events.length === 0}
								<p class="text-sm text-muted-foreground py-4">No events yet. Interact with the widget to see events.</p>
							{:else}
								<div class="space-y-2">
									{#each events as event (event.id)}
										<div class="rounded-lg border bg-card p-3 text-sm">
											<div class="flex items-center justify-between mb-1">
												<span class="text-xs px-2 py-0.5 rounded-full font-medium {getEventColor(event.type)}">
													{getEventLabel(event.type)}
												</span>
												<span class="text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
											</div>
											{#if event.data}
												<pre class="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</ScrollArea>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</div>
	</header>

	<!-- Widget -->
	<main class="mx-auto max-w-5xl p-4">
		<div class="overflow-hidden rounded-lg border border-gray-300 bg-white shadow">
			<iframe
				src="https://book.mylimobiz.com/v4/demo-limoanywhere"
				title="Limo Anywhere Booking Widget"
				class="w-full"
				style="min-height: 400px; border: none;"
				scrolling="no"
				allow="geolocation"
			></iframe>
		</div>
	</main>
</div>
