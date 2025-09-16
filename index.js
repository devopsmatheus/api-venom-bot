import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { create } from "venom-bot";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let client;
const chromiumArgs = [
    '--disable-web-security',
    '--no-sandbox',
    '--disable-web-security',
    '--aggressive-cache-discard',
    '--disable-cache',
    '--disable-application-cache',
    '--disable-offline-load-stale-cache',
    '--disk-cache-size=0',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--ignore-certificate-errors-spki-list',
]

create({
    browserArgs: chromiumArgs,
    session: "whatsapp-session", // nome da sessão
    multidevice: true // suporta multi-dispositivo
})
    .then((venomClient) => {
        client = venomClient;
        console.log("✅ WhatsApp conectado com sucesso!");
    })
    .catch((err) => {
        console.error("❌ Erro ao iniciar o venom-bot:", err);
    });

app.post("/send", async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ error: "Campos 'phone' e 'message' são obrigatórios." });
        }

        if (!client) {
            return res.status(500).json({ error: "WhatsApp não está conectado ainda." });
        }

        const formattedNumber = phone.includes("@c.us") ? phone : `${phone}@c.us`;

        await client.sendText(formattedNumber, message);
        res.json({ success: true, message: "Mensagem enviada com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ error: "Erro ao enviar mensagem." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
