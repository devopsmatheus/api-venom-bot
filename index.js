import express from "express";
import cors from "cors";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: "/usr/bin/chromium-browser", // Usa o Chromium do sistema
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu"
        ]
    }
});

let isReady = false;

// QR Code para autenticação
client.on("qr", qr => {
    console.log("📲 Escaneie o QR Code abaixo:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ WhatsApp pronto!");
    isReady = true;
});

client.on("auth_failure", msg => {
    console.error("❌ Falha na autenticação:", msg);
});

client.initialize();

const formatPhone = (phone) => {
    let num = phone.toString().replace(/\D/g, "");
    if (!num.startsWith("55")) num = "55" + num;
    return num + "@c.us";
};

app.post("/send", async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ error: "Campos 'phone' e 'message' são obrigatórios." });
        }

        if (!isReady) {
            return res.status(503).json({ error: "WhatsApp ainda não está pronto. Escaneie o QR Code se necessário." });
        }

        const jid = formatPhone(phone);
        console.log(`➡️ Enviando mensagem para ${jid}: ${message}`);
        await client.sendMessage(jid, message);

        return res.json({ success: true, message: "Mensagem enviada com sucesso!" });
    } catch (err) {
        console.error("❌ Erro ao enviar mensagem:", err);
        return res.status(500).json({ error: "Erro ao enviar mensagem." });
    }
});

app.get("/status", (req, res) => {
    res.json({ state: isReady ? "CONNECTED" : "DISCONNECTED" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

process.on("SIGINT", async () => {
    console.log("Encerrando servidor...");
    if (client && client.destroy) {
        try {
            await client.destroy();
            console.log("Sessão WhatsApp finalizada.");
        } catch (e) {
            console.warn("Erro ao encerrar WhatsApp:", e);
        }
    }
    process.exit(0);
});
