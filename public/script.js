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
	addEventListener(document.querySelector('#search'), 'click', async e => {
		for (const el of document.querySelectorAll('.time-block')) {
			el.remove()
		}
		const username = document.querySelector('input#username').value
		const res = await fetch(`/user?name=${username}`)
		const json = await res.json()
		json.forEach(timeBlock => renderTimeBlock(timeBlock))
		document.querySelector('#opacity').value = '10'
	})
	addEventListener(document.querySelector('#opacity'), 'change', e => {
		const timeBlocks = document.querySelectorAll('.time-block')
		timeBlocks.forEach(block => {
			const alpha = e.target.value / 100
			block.style.backgroundColor = `hsla(0, 100%, 50%, ${alpha})`
		})
	})
	addEventListener(document.querySelector('input#username'), 'keydown', e => {
		if (e.key === 'Enter' || e.keyCode === 13) document.querySelector('#search').click()
	})
})

function renderTimeBlock(timeBlock) {
	const { day, start, stop } = timeBlock
	const id = `${day}-${start}-${stop}`
	const dayRow = document.querySelector(`#${day.toLowerCase()}`)
	dayRow.appendChild(html(`<div class='time-block' id='${id}'></div>`))
	const timeBlockEl = document.querySelector(`#${id}`)
	const startPos = getPositionFromTime(start)
	const stopPos = getPositionFromTime(stop)
	timeBlockEl.style.left = startPos + '%'
	timeBlockEl.style.right = 100 - stopPos + '%'
}

function getPositionFromTime(time) {
	const hours = time.slice(0, 2)
	const minutes = time.slice(-2)
	const totalMinutes = Number(minutes) + Number(hours) * 60
	return (totalMinutes / (24 * 60)) * 100
}

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