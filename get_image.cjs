const https = require('https');
https.get('https://www.instagram.com/pecasbakery________/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/property="og:image" content="(.*?)"/);
    if (match) {
      console.log(match[1]);
    } else {
      console.log("No og:image found");
    }
  });
}).on('error', console.error);
