import Groq from 'groq-sdk';
import { logger } from './logger.js';
import { readEnvFile } from './env.js';

export async function transcribeAudio(
  buffer: Buffer,
  mimeType = 'audio/ogg',
): Promise<string | null> {
  const envVars = readEnvFile(['GROQ_API_KEY']);
  const apiKey = process.env.GROQ_API_KEY || envVars.GROQ_API_KEY;
  if (!apiKey) {
    logger.warn('GROQ_API_KEY not set — voice transcription disabled');
    return null;
  }
  try {
    const client = new Groq({ apiKey });
    const file = new File([buffer], 'voice.ogg', { type: mimeType });
    const result = await client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
    });
    logger.info({ chars: result.text.length }, 'Transcribed voice message');
    return result.text;
  } catch (err: any) {
    logger.error({ err: err.message }, 'Groq transcription failed');
    return null;
  }
}
