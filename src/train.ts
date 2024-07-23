import fs from 'fs';
import { NlpManager } from 'node-nlp';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const intentsPath = process.env.INTENTS_PATH || path.resolve(__dirname, '../Intents');

export const manager = new NlpManager({ languages: ['en'] });

async function trainManager() {
  try {
    const intentFiles = await fs.promises.readdir(intentsPath);

    for (const file of intentFiles) {
      try {
        const filePath = path.join(intentsPath, file);
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        const intent = file.replace('.json', '');

        for (const utterance of jsonData.utterances) {
          manager.addDocument('en', utterance, intent);
        }

        for (const response of jsonData.responses) {
          manager.addAnswer('en', intent, response);
        }
      } catch (error) {
        console.error(`Error processing intent file ${file}:`, error);
      }
    }

    await manager.train();
  } catch (error) {
    console.error('Error reading intent files:', error);
  }
}

trainManager()
  .then(async () => {
    await manager.save();
  })
  .catch(error => console.error('Error training NLP manager:', error));

module.exports = {
  manager,
  trainManager,
};
