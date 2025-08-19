// Import libraries
import {
    remove,
    BaseDirectory,
} from '@tauri-apps/plugin-fs';

// Delete file
export async function deleteFile(fileName: string): Promise<void> {
    return await remove(fileName, { baseDir: BaseDirectory.Document });
}