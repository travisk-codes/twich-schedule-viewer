const path = require('path')
const express = require('express')
const request = require('request')
const moment = require('moment')
require('dotenv').config()

const { client_id, client_secret } = process.env

const app = express()
const port = 7792

let accessToken

app.use(express.static(path.join(__dirname, 'public')))

// <a href='https://streamlikelihood.homaro.co/user?name=homaro_co'>Search</a>
app.get('/user', (req, res) => {
	console.log('/user hit')
	const username = req.query.name
	const userIdRequest = {
		url: `https://api.twitch.tv/helix/users?login=${username}`,
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Client-Id': client_id,
		},
	}
	request.get(userIdRequest, (err, _, body) => {
		user_id = JSON.parse(body).data[0].id
		console.log('User id obtained!')
		const videosRequest = {
			url: `https://api.twitch.tv/helix/videos?user_id=${user_id}`,
			form: {
				start_time: '2024-05-06T00:00:00Z',
				type: 'archive',
			},
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Client-Id': client_id,
			},
		}
		request.get(videosRequest, (err, _, body) => {
			const videos = JSON.parse(body).data
			const timeBlocks = videos.map(video => getTimeBlockFrom(video))
			res.json(timeBlocks)
		})
	})
})

function getTimeBlockFrom(video) {
	const time = moment(video.created_at)
	const momentCompatibleDuration = convertToMomentDuration(video.duration)
	const duration = moment.duration(momentCompatibleDuration)
	console.log(time.toString(), momentCompatibleDuration)
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
const convertToMomentDuration = duration => duration
	.replace('h', ':')
	.replace('m', ':')
	.replace('s', '')

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