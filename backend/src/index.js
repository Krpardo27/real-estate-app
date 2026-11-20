import server from './server.js';

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1";
if (!Number.isSafeInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error("Puerto inválido.");

server.listen(PORT, HOST, () => console.log(`Servidor escuchando en http://${HOST}:${PORT}`));
