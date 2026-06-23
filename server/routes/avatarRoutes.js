const express = require('express');
const http = require('http');
const https = require('https');
const { findUserById } = require('../repositories/userRepository');

const router = express.Router();

const fetchAvatar = (url, redirectCount = 0) => new Promise((resolve, reject) => {
  const client = url.startsWith('https:') ? https : http;
  const request = client.get(url, {
    timeout: 5000,
    headers: {
      'User-Agent': 'TT-talking-twice avatar proxy',
    },
  }, (response) => {
    const statusCode = Number(response.statusCode || 0);
    if ([301, 302, 303, 307, 308].includes(statusCode) && response.headers.location && redirectCount < 3) {
      response.resume();
      resolve(fetchAvatar(new URL(response.headers.location, url).toString(), redirectCount + 1));
      return;
    }

    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
      resolve({
        ok: statusCode >= 200 && statusCode < 300,
        statusCode,
        contentType: response.headers['content-type'] || 'image/jpeg',
        buffer: Buffer.concat(chunks),
      });
    });
  });

  request.on('timeout', () => request.destroy(new Error('Avatar request timed out')));
  request.on('error', reject);
});

router.get('/:userId', async (req, res, next) => {
  try {
    const userId = String(req.params.userId || '');
    if (!/^\d+$/.test(userId)) {
      return res.sendStatus(404);
    }

    const user = await findUserById(userId);
    const qq = String(user?.qq || '').trim();
    if (!/^\d{5,12}$/.test(qq)) {
      console.warn(`Avatar unavailable for user ${userId}: QQ is not set.`);
      return res.sendStatus(404);
    }

    const urls = [
      `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`,
      `http://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`,
    ];
    let upstream = null;
    for (const url of urls) {
      try {
        const response = await fetchAvatar(url);
        if (response.ok) {
          upstream = response;
          break;
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn(`Avatar upstream failed: ${error.message}`);
        }
      }
    }

    if (!upstream) {
      console.warn(`Avatar upstream unavailable for user ${userId}.`);
      return res.sendStatus(404);
    }

    res.setHeader('Content-Type', upstream.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(upstream.buffer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
