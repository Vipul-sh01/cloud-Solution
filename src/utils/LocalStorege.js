import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveToLocalStorage = async (localPath) => {
    try {
        if (!localPath) return null;

        const destinationFolder = path.join(__dirname, 'uploads');
        const fileName = path.basename(localPath);
        const destinationPath = path.join(destinationFolder, fileName);

        await fs.mkdir(destinationFolder, { recursive: true });
        await fs.copyFile(localPath, destinationPath);
        await fs.unlink(localPath);

        return { message: 'File saved locally', filePath: destinationPath };
    } catch (error) {
        console.error('Error saving file locally:', error);

        if (await fs.stat(localPath).catch(() => false)) {
            await fs.unlink(localPath);
        }

        return null;
    }
};

export { saveToLocalStorage };
