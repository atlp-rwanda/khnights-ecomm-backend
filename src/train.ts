
import fs from 'fs'
// @ts-expect-error 
// Temporarily suppressing due to missing type definitions for node-nlp (consider creating a .d.ts file to fix this error )
import { NlpManager } from 'node-nlp';

export const manager = new NlpManager({ languages: ["en"] });

async function trainManager() {
  const intentFiles = fs.readdirSync('./intents'); 

  for (const file of intentFiles) {
    try {
      const filePath = `./intents/${file}`;
      const data = await fs.promises.readFile(filePath, 'utf8'); 
      const jsonData = JSON.parse(data);

      const intent = file.replace('.json', '');

      for (const utterances of jsonData.utterances) {
        manager.addDocument('en', utterances, intent);
      }

      for (const responses of jsonData.responses) {
        manager.addAnswer('en', intent, responses);
      }
    } catch (error) {
      console.error(`Error processing intent file ${file}:`, error);
    }
  }

  await manager.train(); 
}

trainManager()
  .then(async () => {
    manager.save();
  })
  .catch((error) => console.error('Error training NLP manager:', error));

  module.exports = {
    manager,
    trainManager
  };
