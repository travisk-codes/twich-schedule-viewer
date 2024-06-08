const path = require('path')
const express = require('express')
const request = require('request')
const moment = require('moment')
require('dotenv').config()

const { client_id, client_secret } = process.env

const app = express()
const port = 7792
const videoFetchCount = 100
const maxVideos = 1000

let accessToken

app.use(express.static(path.join(__dirname, 'public')))

// <a href='https://streamlikelihood.homaro.co/user?name=homaro_co'>Search</a>
app.get('/user', (req, res) => {
	const username = req.query.name
	const userIdRequest = {
		url: `https://api.twitch.tv/helix/users?login=${username}`,
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Client-Id': client_id,
		},
	}
	request.get(userIdRequest, async (err, _, body) => {
		user_id = JSON.parse(body).data[0].id
		let allVideos = []
		let currentVideos = []
		let cursor = ''
		do {
			currentVideos = await	fetchMoreVideos(cursor)
			allVideos = allVideos.concat(currentVideos.data)
			cursor = currentVideos.pagination.cursor
		} while (
			currentVideos.data.length === videoFetchCount
			&& allVideos.length <= maxVideos
		)
		console.log('Videos for', username, ':', allVideos.length)
		const timeBlocks = allVideos.map(video => getTimeBlockFrom(video))
		res.json(timeBlocks)
		// const videosRequest = {
		// 	url: `https://api.twitch.tv/helix/videos?user_id=${user_id}&first=100`,
		// 	form: {
		// 		type: 'archive',
		// 	},
		// 	headers: {
		// 		'Authorization': `Bearer ${accessToken}`,
		// 		'Client-Id': client_id,
		// 	},
		// }
		// request.get(videosRequest, (err, _, body) => {
		// 	const videos = JSON.parse(body).data
		// 	// console.log('fetched', videos.length, 'videos')
		// 	const timeBlocks = videos.map(video => getTimeBlockFrom(video))
		// 	res.json(timeBlocks)
		// })
	})
})

async function fetchMoreVideos(cursor) {
	const url = 'https://api.twitch.tv/helix/videos?'
	const headers = {
		'Authorization': `Bearer ${accessToken}`,
		'Client-Id': client_id,
	}
	const query = new URLSearchParams({
		user_id,
		first: videoFetchCount,
		type: 'archive',
		after: cursor,
	})
	const res = await fetch(`${url}${query}`, { headers })
	return res.json()
}

function getTimeBlockFrom(video) {
	const time = moment(video.created_at)
	const momentCompatibleDuration = convertToMomentDuration(video.duration)
	const duration = moment.duration(momentCompatibleDuration)
	const day = time.format('dddd')
	const start = time.format('HHmm')
	const stop = time.add(duration).format('HHmm')
	return {
		day,
		start,
		stop,
	}
}

// 4h48m3s -> 4:48:03
// 4m -> 00:04:00
// 10h3s -> 10:00:03
function isCharNumber(c) {
  return c >= '0' && c <= '9';
}
const convertToMomentDuration = duration => {
	d = duration.split('')

	let hours = '00'
	let minutes = '00'
	let seconds = '00'

	let h = d.indexOf('h') !== -1 ? d.indexOf('h') : 0
	let m = d.indexOf('m') !== -1 ? d.indexOf('m') : 0
	let s = d.indexOf('s') !== -1 ? d.indexOf('s') : 0

	if (s) {
		let ones = d[s - 1]
		let tens = d[s - 2]
		if (isCharNumber(tens)) {
			seconds = `${tens}${ones}`
		} else {
			seconds = `0${ones}`
		}
	}

	if (m) {
		let ones = d[m - 1]
		let tens = d[m - 2]
		if (isCharNumber(tens)) {
			minutes = `${tens}${ones}`
		} else {
			minutes = `0${ones}`
		}
	}	

	if (h) {
		let ones = d[h - 1]
		let tens = d[h - 2]
		if (isCharNumber(tens)) {
			hours = `${tens}${ones}`
		} else {
			hours = `0${ones}`
		}
	}
	return `${hours}:${minutes}:${seconds}`
}

// Get an access token so we can use the Twitch API
const accessTokenRequest = {
	url: 'https://id.twitch.tv/oauth2/token?',
	form: {
		client_id,
		client_secret,
		grant_type: 'client_credentials',
	}
}

request.post(accessTokenRequest, (err, res, body) => {
	try {
		if (!err && express.response.statusCode == 200) {
			body = JSON.parse(body)
			accessToken = body.access_token
			console.log('Access token obtained!')
		}
	} catch (e) {
		throw new Error(e)
	}
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})