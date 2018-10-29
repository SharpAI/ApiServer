const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;

app.get('/', (request, response) => response.send('hello world'));

app.use('/api', router);

router.get('/post', (request, response) => {
	console.log(request.originalUrl)
	response.json({message: 'hello, welcome to my server'});
    });

app.listen(port, () => console.log('Listening on port ${port}'));