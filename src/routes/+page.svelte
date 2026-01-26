<script lang="ts">
	let eventLog = $state<Array<{ time: string; event: string; data: unknown }>>([]);
	let bridgeReady = $state(false);

	// Listen for postMessage events to display in UI
	if (typeof window !== 'undefined') {
		window.addEventListener('message', (event) => {
			if (event.origin !== 'https://book.mylimobiz.com') return;

			const message = event.data;
			if (!message || message.type !== 'LA_DATALAYER_EVENT') return;

			const payload = message.payload;
			if (!payload || !payload.eventName) return;
			if (payload.eventName.startsWith('gtm.')) return;

			// Track bridge ready
			if (payload.eventName === 'la_bridge_init') {
				bridgeReady = true;
			}

			eventLog = [
				{
					time: new Date(payload.timestamp || Date.now()).toLocaleTimeString(),
					event: payload.eventName,
					data: payload.data
				},
				...eventLog
			].slice(0, 50);
		});
	}

	function clearEvents() {
		eventLog = [];
	}

	function exportEvents() {
		const blob = new Blob([JSON.stringify(eventLog, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `datalayer-events-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>DataLayer Bridge Test</title>
	<!-- Parent Receiver - configured via data attributes -->
	<script
		data-la-bridge
		data-debug="true"
		data-measurement-id="G-ZW4QZ889NM"
		data-allowed-origins="https://book.mylimobiz.com"
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
				class="inline-block h-3 w-3 rounded-full {bridgeReady ? 'bg-green-500' : 'bg-yellow-500'}"
			></span>
			<span class="text-sm text-gray-700">
				{bridgeReady ? 'Bridge Connected' : 'Waiting for widget...'}
			</span>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Iframe Section -->
		<section class="rounded-lg bg-white p-4 shadow">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">Booking Widget (iframe)</h2>
			<div class="aspect-[4/3] w-full overflow-hidden rounded border border-gray-300">
				<iframe
					src="https://book.mylimobiz.com/v4/demo-limoanywhere"
					title="Limo Anywhere Booking Widget"
					class="h-full w-full"
					allow="geolocation"
				></iframe>
			</div>
		</section>

		<!-- Event Log Section -->
		<section class="rounded-lg bg-white p-4 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-800">
					Event Log <span class="text-sm font-normal text-gray-500">({eventLog.length})</span>
				</h2>
				<div class="flex gap-2">
					<button
						onclick={exportEvents}
						class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
					>
						Export
					</button>
					<button
						onclick={clearEvents}
						class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
					>
						Clear
					</button>
				</div>
			</div>

			<div class="h-96 overflow-y-auto rounded border border-gray-200 bg-gray-900 p-2 font-mono text-sm">
				{#if eventLog.length === 0}
					<p class="py-8 text-center text-gray-500">
						Waiting for dataLayer events...<br />
						<span class="text-xs">Interact with the booking widget to see events.</span>
					</p>
				{:else}
					<ul class="space-y-2">
						{#each eventLog as log (log.time + log.event + JSON.stringify(log.data))}
							{@const isEcommerce = ['purchase', 'begin_checkout', 'view_item_list', 'select_item', 'add_payment_info', 'form_start'].includes(log.event)}
							<li
								class="rounded border-l-4 p-2 {isEcommerce
									? 'border-purple-500 bg-purple-950'
									: 'border-green-500 bg-gray-800'}"
							>
								<div class="flex items-center gap-2">
									<span class="text-xs text-gray-500">{log.time}</span>
									<span class="font-semibold {isEcommerce ? 'text-purple-300' : 'text-green-400'}">
										{log.event}{isEcommerce ? ' ★' : ''}
									</span>
								</div>
								<pre class="mt-1 overflow-x-auto text-xs text-cyan-300">{JSON.stringify(log.data, null, 2)}</pre>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	</div>

	<!-- Debug Info -->
	<section class="mt-6 rounded-lg bg-white p-4 shadow">
		<h2 class="mb-2 text-lg font-semibold text-gray-800">Configuration</h2>
		<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
			<div>
				<span class="text-gray-500">Debug Mode:</span>
				<span class="ml-2 font-mono text-xs">true</span>
			</div>
		</div>
	</section>
</div>
