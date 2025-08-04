import {
  readTextFile,
  writeTextFile,
  exists,
  remove,
  open,
  BaseDirectory
} from '@tauri-apps/plugin-fs';

import { appDataDir, join } from '@tauri-apps/api/path';

// Lấy path đầy đủ tới file
export async function getFilePath(fileName: string): Promise<string> {
  const dir = await appDataDir();
  return await join(dir, fileName);
}

// Đọc file
export async function readFile(path: string): Promise<string> {
  try {
    return await readTextFile(path, { baseDir: BaseDirectory.AppData });
  } catch (err: any) {
    if (err?.message?.includes('Permission denied')) {
      throw new Error('Không có quyền truy cập file. Kiểm tra lại scope trong tauri.conf.json');
    } else if (err?.message?.includes('No such file or directory')) {
      throw new Error('File không tồn tại');
    } else {
      throw new Error(`Lỗi không xác định: ${err.message}`);
    }
  }
}

// Ghi đè file
export async function writeFile(path: string, content: string): Promise<void> {
  await writeTextFile(path, content, { baseDir: BaseDirectory.AppData });
}

// Thêm nội dung vào file (object mới vào mảng)
export async function appendToFile<T extends Record<string, any>>(path: string, newObj: T): Promise<void> {
  let data: T[] = [];

  const fileExists = await exists(path, { baseDir: BaseDirectory.AppData });
  if (fileExists) {
    const raw = await readTextFile(path, { baseDir: BaseDirectory.AppData });
    try {
      data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('File không phải JSON array');
    } catch (err) {
      throw new Error('Lỗi khi parse JSON: ' + err);
    }
  }

  data.push(newObj);
  await writeTextFile(path, JSON.stringify(data, null, 2), {
    baseDir: BaseDirectory.AppData
  });
}

// Xoá file
export async function deleteFile(path: string): Promise<void> {
  await remove(path, { baseDir: BaseDirectory.AppData });
}

// Xoá object theo điều kiện
export async function deleteObjectInFile<T extends Record<string, any>>(
  path: string,
  filterFn: (obj: T) => boolean
): Promise<void> {
  const fileExists = await exists(path, { baseDir: BaseDirectory.AppData });
  if (!fileExists) throw new Error("File không tồn tại");

  const raw = await readTextFile(path, { baseDir: BaseDirectory.AppData });

  let data: T[];
  try {
    data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("File không phải JSON array");
  } catch (err) {
    throw new Error("Lỗi khi parse JSON: " + err);
  }

  const filtered = data.filter(obj => !filterFn(obj));
  await writeTextFile(path, JSON.stringify(filtered, null, 2), {
    baseDir: BaseDirectory.AppData
  });
}
