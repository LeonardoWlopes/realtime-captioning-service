const loremIpsumPhrases = [
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	'Nullam feugiat velit sed urna malesuada, quis condimentum massa ultrices.',
	'Sed tincidunt nibh nec tellus faucibus, in finibus tortor tristique.',
	'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.',
	'Donec euismod consequat velit, non pharetra enim venenatis in.',
	'Duis tincidunt justo neque, eget commodo dui cursus vitae.',
	'Phasellus auctor eros eu sem elementum, quis lobortis ipsum commodo.',
	'Maecenas malesuada quam vitae metus condimentum, id gravida urna tempus.',
	'Fusce laoreet nunc in lorem finibus, a suscipit magna ultricies.',
	'Proin varius sem at dolor efficitur, ac lobortis ligula vulputate.',
	'Nulla facilisi. Aenean eleifend eros non nulla elementum, vel hendrerit eros hendrerit.',
	'Cras sed rhoncus neque, vitae tincidunt neque.',
	'Morbi feugiat enim id lacus faucibus, eget venenatis tellus vehicula.',
	'Integer et magna at quam tincidunt rutrum ac ac est.',
	'Etiam commodo urna at nunc sodales, in consequat ex varius.',
]

export function generateCaption() {
	const numPhrases = Math.floor(Math.random() * 2) + 1

	let caption = ''

	for (let i = 0; i < numPhrases; i++) {
		const randomIndex = Math.floor(Math.random() * loremIpsumPhrases.length)
		caption += `${loremIpsumPhrases[randomIndex]} `
	}

	return caption.trim()
}
