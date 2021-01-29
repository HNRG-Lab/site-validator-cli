'use strict'

const path = require('path')
const fetchFile = require('./fetch-file')
const Cache = require('../Cache')
const { greenOnBlack } = require('../clc')

module.exports = async (url, cacheTime, clearCache) => {
  const urlHash = require('crypto').createHash('sha1').update(url).digest('hex')

  var cachePath = path.resolve(`${__dirname}/../../cache/sitemap/`)
  var cache = new Cache(urlHash, cachePath, cacheTime)
  var cacheOld

  if (clearCache) {
    cache.remove()
    console.log(`\nCache cleared for ${url}`)
  } else {
    cacheOld = cache.getKey(url)
  }

  if (cacheTime !== false && cacheOld !== undefined) {
    console.log('\n' + greenOnBlack('Success') + ` Online File Cache found for ${url}`)
    console.log('\n' + 'Pages found in cache')
    cacheOld.forEach(e => { console.log(greenOnBlack(e)) })
    return cacheOld
  } else {
    var urls = await fetchFile(url)
    if (cacheTime !== false) {
      cache.setKey(url, urls)
      cache.save()
    }
    console.log('\n' + 'Pages found:')
    urls.forEach(e => { console.log(greenOnBlack(e)) })
    return urls
  }
}
