const express = require('express')
const fetch = require('node-fetch')

const API_BASE = process.env.API_BASE
const GENIUS_ACCESSTOKEN = process.env.GENIUS_ACCESSTOKEN

const endpoints = app => {
  app.get(API_BASE + '/search/:query', async (req, res, next) => {
    const { query } = req.params

    try {
      const response = await fetch(`https://api.genius.com/search?q=${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${GENIUS_ACCESSTOKEN}`
        }
      })

      const data = await response.json()

      res.status(200).send(data.response.hits)
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong: ' + error })
    }
  })
}

module.exports = {
  endpoints
}
