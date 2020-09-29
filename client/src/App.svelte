<script>
	import data from './data'
	console.log(data)
	const blendmodes = ['MULTIPLY', 'SCREEN', 'OVERLAY', 'DIFFERENCE', 'DODGE']
	let blendmode = blendmodes[2]
	const pictures = [1, 2, 3, 4, 5, 6, 7, 8]
	let picture = pictures[0]
	const classifiers = ['vision', 'mobilenet']
	const classifications = {
		vision: 9,
		mobilenet: 2
	}
	let classifier = classifiers[0]

	// const imageSizes = [16, 32, 64, 128, 256, 512]
	let imageSize = 64
	const imageMargin = 2
	$: images = data[picture][blendmode]
	$: labels = [...new Set(images.map(img => img[classifier].map(c => c[0])).flat())].sort()
	
	let label = null
	function setLabel(l) {
		label = l
	}
	function resetLabel() {
		label = null
	}

	let image = null
	function setImage(i) {
		image = i
	}
	function resetImage() {
		image = null
	}
</script>

<main>
	<h1>I Want to Be a Superhero</h1>
	<select bind:value={blendmode}>
		{#each blendmodes as b}
			<option value={b}>
				{b}
			</option>
		{/each}
	</select>
	<select bind:value={picture}>
		{#each pictures as p}
			<option value={p}>
				{p}
			</option>
		{/each}
	</select>
	<select bind:value={classifier}>
		{#each classifiers as c}
			<option value={c}>
				{c}
			</option>
		{/each}
	</select>
	<!-- <select bind:value={imageSize}>
		{#each imageSizes as i}
			<option value={i}>
				{i}
			</option>
		{/each}
	</select> -->
	<svg width={imageSize * 18 + imageMargin * 17} height={imageSize * 9 + imageMargin * 8}>
		{#each images as img, i}
			<image href={img.img} 
				height={imageSize} 
				width={imageSize}
				on:mouseout={resetImage} on:mouseenter={setImage([img, i])}
				x={(imageSize + imageMargin) * Math.floor(i / 9)} y={(imageSize + imageMargin) * (i % 9)} 
				opacity={label === null ? 1 : img[classifier].find(c => c[0] === label) ? 1 - img[classifier].findIndex(c => c[0] === label) / classifications[classifier] * 0.6 : 0.1}/>
		{/each}
		{#if image !== null}
			<rect
				class="no-events"
				height={imageSize * 2 + imageMargin * 2} 
				width={imageSize * 2 + imageMargin * 2}
				fill="#fff"
				x={(imageSize + imageMargin) * Math.floor(image[1] / 9) - imageSize / 2 - imageMargin} 
				y={(imageSize + imageMargin) * (image[1] % 9) - imageSize / 2 - imageMargin} />
			<image href={image[0].img} 
				class="no-events"
				height={imageSize * 2} 
				width={imageSize * 2}
				x={(imageSize + imageMargin) * Math.floor(image[1] / 9) - imageSize / 2} 
				y={(imageSize + imageMargin) * (image[1] % 9) - imageSize / 2} />
		{/if}
	</svg>
	<div class="labels">
		{#each labels as l}
			<span on:mouseout={resetLabel} on:mouseenter={setLabel(l)} class={image && image[0][classifier].map(c => c[0]).indexOf(l) !== -1 ? 'active' : ''}>{l}</span>
		{/each}
	</div>
</main>

<style>
	main {
		/* text-align: center; */
		padding: 1em;
		/* margin: 0 auto; */
	}

	h1 {
		margin: 0 0 1em 0;
		font-size: 1em;
		text-transform: uppercase;
	}

	svg {
		display: block;
		margin: 1em 0px;
		overflow: visible;
	}

	.labels span {
		white-space: nowrap;
		display: inline-block;
		padding: 2px 4px;
		margin: 0px 4px 4px 0px;
		background: #333;
		color: #fff;
		border-radius: 2px;
		cursor: default;
	}

	.labels span:hover {
		background: #6236FF;
	}

	.labels span.active {
		background: #6236FF;
	}

	.no-events {
		pointer-events: none;
	}
</style>