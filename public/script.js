function html(htmlString) {
	const template = document.createElement('template')
	template.innerHTML = htmlString.trim()
	return template.content
}

function ready(fn) {
	if (document.readyState !== 'loading') fn()
	else document.addEventListener('DOMContentLoaded', fn)
}

ready(() => {
	const sundayRow = document.querySelector('#sunday')
	sundayRow.appendChild(html(`<div id='time-block-1' class='time-block'></div>`))
	const timeBlock = document.querySelector('#time-block-1')
	timeBlock.style.width = '40px'
	timeBlock.style.position = 'absolute'
	timeBlock.style.left = '200px'
	sundayRow.appendChild(html(`<div id='time-block-2' class='time-block'></div>`))
	const timeBlock2 = document.querySelector('#time-block-2')
	timeBlock2.style.width = '80px'
	timeBlock2.style.position = 'absolute'
	timeBlock2.style.left = '220px'
	addEventListener(document.querySelector('#search'), 'click', async e => {
		const username = document.querySelector('input#username').value
		const res = await fetch(`/user?name=${username}`)
		const json = await res.json()
		console.log(json)
	})
})

function addEventListener(el, eventName, eventHandler, selector) {
	if (selector) {
		const wrappedHandler = (e) => {
			if (!e.target) return;
			const el = e.target.closest(selector);
			if (el) {
				eventHandler.call(el, e);
			}
		};
		el.addEventListener(eventName, wrappedHandler);
		return wrappedHandler;
	} else {
		const wrappedHandler = (e) => {
			eventHandler.call(el, e);
		};
		el.addEventListener(eventName, wrappedHandler);
		return wrappedHandler;
	}
}