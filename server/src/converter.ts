import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const convertUsdzToGlb = async (inputPath: string, outputPath: string): Promise<void> => {
  try {
    // First convert USDZ to USD
    const usdPath = path.join(path.dirname(inputPath), `${path.parse(inputPath).name}.usdc`);
    await execAsync(`usdzip -unpack "${inputPath}" "${path.dirname(usdPath)}"`);

    // Then convert USD to GLB using usd2gltf
    await execAsync(`usd2gltf -i "${usdPath}" -o "${outputPath}"`);

    // Clean up intermediate USD file
    await execAsync(`rm "${usdPath}"`);
  } catch (error) {
    console.error('Error during conversion:', error);
    throw new Error('Failed to convert USDZ to GLB');
  }
}; 