import { readdirSync, statSync } from "fs";
import path from "path";
import { serviceManager } from "src/services/serviceManager";
import { pathToFileURL } from "url";

/**
 * Dynamically import all files in a directory and its subdirectories.
 * @param dir Directory to scan
 */
export async function importFiles(dir: string): Promise<any[]> {
    const logger = serviceManager.getLogger();
    const absoluteDir = path.resolve(dir);
    const files = readdirSync(absoluteDir);

    const modules: any[] = [];

    for (const file of files) {
        const fullPath = path.join(absoluteDir, file);

        if (statSync(fullPath).isDirectory()) {
            const subModules = await importFiles(fullPath);
            modules.push(...subModules);
        } else if (file.toLowerCase().endsWith('.ts') || file.toLowerCase().endsWith('.js')) {
            try {
                logger.verbose(`Importing: ${fullPath}`);
                const module = await import(pathToFileURL(fullPath).href);
                modules.push(module.default || module);
            } catch (error) {
                logger.warn(`Failed to import: ${fullPath}`);
                console.error(error);
            }
        }
    }

    return modules
}