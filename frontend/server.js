const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const xlsx = require("xlsx");
const textract = require("textract");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(`${process.env.API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const PORT = 8000;
app.use(express.json());
app.use(cors());

const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }); // 2 MB limit

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  try {
    let text = "";
    const fileType = file.mimetype;

    if (fileType === "application/pdf") {
      const data = await pdfParse(file.buffer);
      text = data.text;
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await mammoth.extractRawText({ buffer: file.buffer });
      text = data.value;
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileType === "application/vnd.ms-excel"
    ) {
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        text += sheet;
      });
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      fileType === "application/vnd.ms-powerpoint"
    ) {
      text = await new Promise((resolve, reject) => {
        textract.fromBufferWithMime(fileType, file.buffer, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    } else {
      return res.status(400).send({ message: "Unsupported file type" });
    }

    // Store text in memory or a database, depending on your architecture
    // Here we store it in a global variable for simplicity
    global.documentText = text;
    res.send({ message: "File uploaded and text extracted successfully" });
  } catch (error) {
    console.error("File processing error:", error);
    res.status(500).send({ message: "Error processing file" });
  }
});

app.post("/completions", async (req, res) => {
  const userMessage = req.body.message;
  const documentText = global.documentText || "";

  const combinedPrompt = `${documentText}\n\n User: ${userMessage}`;
  // Call Gemini or any other API here using combinedPrompt
  const result = await model.generateContent(combinedPrompt);
  console.log(userMessage);
  res.send({ message: result.response.text() });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
