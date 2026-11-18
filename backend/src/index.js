import server from './server.js';

const PORT = process.env.PORT || 5000;
console.log(PORT);

server.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
	console.log(`Frontend permitido: ${process.env.FRONTEND_URL}`);
	console.log(`Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
