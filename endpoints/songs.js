const express = require('express')
const fetch = require('node-fetch')
const scrapeIt = require('scrape-it')

const language = require('@google-cloud/language')

const API_BASE = process.env.API_BASE
const GENIUS_ACCESSTOKEN = process.env.GENIUS_ACCESSTOKEN

const client = new language.LanguageServiceClient()

const endpoints = app => {
  app.get(API_BASE + '/songs/:query', async (req, res, next) => {
    const { query } = req.params
    try {
      const songRequest = await fetch(`https://api.genius.com/songs/${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${GENIUS_ACCESSTOKEN}`
        }
      })

      const songResponse = await songRequest.json()
      const song = songResponse.response.song

      const { url } = song

      const {
        data: { lyrics }
      } = await scrapeIt(url, {
        lyrics: '.lyrics'
      })

      const sanitized = lyrics
        .replace(/(\r\n\t|\n|\r\t)/gm, ' ')
        .replace('[Intro]', '')
        .replace('[Post-Chorus]', '')
        .replace('[Chorus]', '')
        .replace('[Chorus 1]', '')
        .replace('[Chorus 2]', '')
        .replace('[Verse 1]', '')
        .replace('[Verse 2]', '')
        .replace('[Verse 3]', '')
        .replace('[Bridge]', '')

      const results = await client.analyzeSentiment({
        document: {
          content: sanitized,
          type: 'PLAIN_TEXT'
        }
      })

      res
        .status(200)
        .send({ song, lyrics, sentiment: results[0].documentSentiment })
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong: ' + error })
    }
  })
}

module.exports = {
  endpoints
}
