<script lang="ts">
	import { onMount } from 'svelte';

	let eventLog = $state<Array<{ time: string; event: string; data: unknown }>>([]);
	let receiverReady = $state(false);

	onMount(() => {
		// Initialize the parent receiver after script loads
		const checkReceiver = setInterval(() => {
			if (typeof window.LADataLayerReceiver !== 'undefined') {
				clearInterval(checkReceiver);

				new window.LADataLayerReceiver({
					allowedOrigins: ['https://book.mylimobiz.com'],
					eventPrefix: 'la_',
					debug: true,
					onEvent: (event: { eventName: string; data: unknown; timestamp: number }) => {
						eventLog = [
							{
								time: new Date(event.timestamp).toLocaleTimeString(),
								event: event.eventName,
								data: event.data
							},
							...eventLog
						].slice(0, 50); // Keep last 50 events
					}
				});

				receiverReady = true;
				console.log('[Test Page] LA Bridge Receiver initialized');
			}
		}, 100);

		return () => clearInterval(checkReceiver);
	});
</script>

<svelte:head>
	<title>DataLayer Bridge Test</title>
	<script
		src="https://mrzmqoooanbzfuffrcef.supabase.co/storage/v1/object/public/cdn/la-bridge/parent-receiver.min.js"
	></script>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-4">
	<header class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">DataLayer Bridge Test Page</h1>
		<p class="text-gray-600">
			Testing postMessage bridge from Limo Anywhere widget to parent page
		</p>
		<div class="mt-2 flex items-center gap-2">
			<span
				class="inline-block h-3 w-3 rounded-full {receiverReady ? 'bg-green-500' : 'bg-yellow-500'}"
			></span>
			<span class="text-sm text-gray-700">
				{receiverReady ? 'Receiver Ready' : 'Loading receiver...'}
			</span>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Iframe Section -->
		<section class="rounded-lg bg-white p-4 shadow">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">Booking Widget (iframe)</h2>
			<div class="aspect-[4/3] w-full overflow-hidden rounded border border-gray-300">
				<iframe
					src="https://book.mylimobiz.com/v2/edleylimo"
					title="Limo Anywhere Booking Widget"
					class="h-full w-full"
					allow="geolocation"
				></iframe>
			</div>
		</section>

		<!-- Event Log Section -->
		<section class="rounded-lg bg-white p-4 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-800">Event Log</h2>
				<button
					onclick={() => (eventLog = [])}
					class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
				>
					Clear
				</button>
			</div>

			<div class="h-96 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2">
				{#if eventLog.length === 0}
					<p class="py-8 text-center text-gray-500">
						No events yet. Interact with the booking widget to see events.
					</p>
				{:else}
					<ul class="space-y-2">
						{#each eventLog as log (log.time + log.event)}
							<li class="rounded border border-gray-200 bg-white p-2 text-sm">
								<div class="flex items-center gap-2">
									<span class="font-mono text-xs text-gray-400">{log.time}</span>
									<span class="font-semibold text-blue-600">{log.event}</span>
								</div>
								<pre class="mt-1 overflow-x-auto text-xs text-gray-600">{JSON.stringify(log.data, null, 2)}</pre>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	</div>

	<!-- Debug Info -->
	<section class="mt-6 rounded-lg bg-white p-4 shadow">
		<h2 class="mb-2 text-lg font-semibold text-gray-800">Debug Info</h2>
		<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
			<div>
				<span class="text-gray-500">Events Received:</span>
				<span class="ml-2 font-semibold">{eventLog.length}</span>
			</div>
			<div>
				<span class="text-gray-500">GA4 Property:</span>
				<span class="ml-2 font-mono text-xs">G-ZW4QZ889NM</span>
			</div>
			<div>
				<span class="text-gray-500">Widget Origin:</span>
				<span class="ml-2 font-mono text-xs">book.mylimobiz.com</span>
			</div>
			<div>
				<span class="text-gray-500">Event Prefix:</span>
				<span class="ml-2 font-mono text-xs">la_</span>
			</div>
		</div>
	</section>
</div>
