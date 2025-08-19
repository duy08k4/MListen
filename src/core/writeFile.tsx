// Import libraries
import {
  writeTextFile,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';

// Write file
export async function writeFile(fileName: string, content: string): Promise<void> {
  await writeTextFile(fileName, content, { baseDir: BaseDirectory.Document });
}