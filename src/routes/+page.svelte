<script lang="ts">
	import { onMount } from 'svelte';

	let bridgeReady = $state(false);
	let eventCount = $state(0);

	onMount(() => {
		// Listen for postMessage events
		window.addEventListener('message', (event) => {
			if (event.origin !== 'https://book.mylimobiz.com') return;

			const message = event.data;
			if (!message || !message.type) return;

			if (message.type === 'LA_IFRAME_HEIGHT' || message.type === 'LA_DATALAYER_EVENT') {
				bridgeReady = true;
				eventCount++;
			}
		});

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
	});
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
				<span class="text-slate-400">Events: {eventCount}</span>
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
