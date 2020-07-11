
import {extname} from  "https://deno.land/std/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";



class FileProcessor {
    constructor(config) {

        // console.log(config)
        // debugger;
        this.originalFileName = config.fileName;
        this.fileExtension = extname(this.originalFileName);
        console.log(this.fileExtension)
        this.fileNameWithoutExtension = config.fileName.split('.').slice(0, -1).join('.')
        this.basePath = config.path[config.path.length - 1] === '/' ? config.path : config.path + '/';

        // console.log(this);
    }

    async getAvailableFileName() {

        return await this.createNewFileName(this.originalFileName);
    }

    async pathExists(path) {
        
        return await exists(path);

    }

    async createNewFileName(fileName, counter = 1) {


        if (! await this.fileNameExists(fileName)) {
            // console.log('new file name', newFileName)
            return fileName;
        }

        counter = counter + 1;
        let newFileName = this.fileNameWithoutExtension + counter + this.fileExtension;

        return await this.createNewFileName(newFileName, counter);

    }


    fileNameExists(fileName) {
        return this.pathExists(this.basePath + fileName);
        

    }
}

export default FileProcessor;
