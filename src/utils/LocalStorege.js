import fs from 'fs';
import path from 'path';

const saveToLocalStorage = async (localPath) => {
    try {
        if (!localPath) return null;
        const destinationFolder = path.join(__dirname, 'uploads');
        const fileName = path.basename(localPath);
        const destinationPath = path.join(destinationFolder, fileName);

        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        fs.copyFileSync(localPath, destinationPath);
        fs.unlinkSync(localPath);

        return { message: 'File saved locally', filePath: destinationPath };
    } catch (error) {
        console.error('Error saving file locally:', error);
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }

        return null;
    }
};

export { saveToLocalStorage };
