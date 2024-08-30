/* c8 ignore start */
import 'dotenv/config'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import bodyParser from 'body-parser'
import express, { type Request, type Response } from 'express'
import multer from 'multer'
import OpenAI from 'openai'

// Initialize Prisma Client
const prisma = new PrismaClient()

// Initialize OpenAI API with your API key
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key in the environment variables
})

const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())

// Set up multer for file upload handling
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log('Saving to /server/uploads/ folder')
		cb(null, './server/uploads')
	},
	filename: (req, file, cb) => {
		const filename = `${Date.now()}-${file.originalname}`
		console.log(`Filename: ${filename}`)
		cb(null, filename)
	},
})

const upload = multer({
	storage,
	limits: { fileSize: 10000000 }, // Limit file size to 10MB for example
	fileFilter: (req, file, cb) => {
		if (file.mimetype !== 'audio/wav' && file.mimetype !== 'audio/mpeg') {
			return cb(new Error('Only .wav or .mp3 files are allowed!'))
		}
		cb(null, true)
	},
})

// Route to handle file upload and transcription
app.post(
	'/upload',
	upload.single('audio'),
	async (req: Request, res: Response) => {
		try {
			const audioFilePath = req.file?.path

			console.log('File uploaded:', req.file) // Log file details

			if (!audioFilePath) {
				return res.status(400).send('No audio file uploaded.')
			}

			// Read the audio file and send it to OpenAI for transcription
			const fileStream = fs.createReadStream(audioFilePath)
			const response = await openai.audio.transcriptions.create({
				file: fileStream,
				model: 'whisper-1',
			})

			const transcription = response.text

			// Save transcription to the database
			const savedTranscription = await prisma.speechTranscription.create({
				data: {
					transcription: transcription,
				},
			})

			// Send back the transcription as the response
			res.json({ transcription: savedTranscription.transcription })

			// Clean up: remove the audio file after processing
			fs.unlink(audioFilePath, (err) => {
				if (err) console.error('Error deleting audio file:', err)
			})
		} catch (error) {
			console.error('Error during transcription:', error)
			res.status(500).send('Error during transcription.')
		}
	},
)

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
