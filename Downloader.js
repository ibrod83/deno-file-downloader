
import sanitize from './sanitize-filename/index.js';
import FileProcessor from './FileProcessor.js';
import { createRequire } from "https://deno.land/std/node/module.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import {basename,extname} from "https://deno.land/std/path/mod.ts";

const mkdir = ensureDir

const require = createRequire(import.meta.url);
// const path = require("path");
var mime = require('./mime-types.js')



const configTypes = {
  url: {
    type: 'string',
    mandatory: true
  },
  directory: {
    type: 'string',
    mandatory: false
  },
  fileName: {
    type: 'string',
    mandatory: false
  },
  cloneFiles: {
    type: 'boolean',
    mandatory: false
  }
};

const validateConfig = (config) => {
  const generateTypeError = (prop) => { throw new Error(`config.${prop} must be of type ${configTypes[prop].type}`) }
  for (let prop in configTypes) {
    if (configTypes[prop].mandatory) {
      if (!config[prop])
        throw new Error(`Must supply a config.${prop}`);

      if (typeof config[prop] !== configTypes[prop].type)
        generateTypeError(prop)
    }
    if (config.hasOwnProperty(prop) && typeof config[prop] !== configTypes[prop].type)
      generateTypeError(prop)
  }
}

// module.exports = class Downloader extends EventEmitter {
export default class Downloader {


  /**
   * 
   * @param {object} config 
   * @param {string} config.url 
   * @param {string} [config.directory]    
   * @param {string} [config.fileName] 
   * @param {boolean} [config.cloneFiles] 
   */
  constructor(config) {
    // super();
    if (!config || typeof config !== 'object') {
      throw new Error('Must provide a valid config object')
    }
    validateConfig(config);

    const defaultConfig = {
      directory: './',
      fileName: null,
      cloneFiles: true,
    }

    this.config = {
      ...defaultConfig,
      ...config
    }

    this.response = null;
    this.readStream = null;
    this.fileSize = null;
    this.currentDataSize = 0;

  }

  async createReadStream(url) {

    const response = await fetch(this.config.url, {
      method: 'GET',
      // responseType: 'stream'
    })

    const contentLength = response.headers['content-length'] || response.headers['Content-Length'];
    this.fileSize = parseInt(contentLength);

    this.response = response;

    return response.body;
  }




  download() {
    // debugger;
    const that = this;

    return new Promise(async (resolve, reject) => {
      try {
        const read = await this.createReadStream(this.config.url);
        let fileName;
        if (this.config.fileName) {
          fileName = this.config.fileName
        } else {
          fileName = this.deduceFileName(this.config.url,this.response.headers)
        }
        var fileProcessor = new FileProcessor({ fileName, path: this.config.directory })
        if (! await fileProcessor.pathExists(this.config.directory)) {
          try {
            await mkdir(this.config.directory, { recursive: true });
          } catch (error) {
          }

        }
        if (this.config.cloneFiles) {

          fileName = await fileProcessor.getAvailableFileName()
        }
       
        const file = await Deno.open(`${this.config.directory}/${fileName}`, { create: true, write: true })

        for await (const chunk of read) {
          await Deno.writeAll(file, chunk);
        }

        file.close();

        resolve();
      } catch (error) {
        reject(error)
      }
    })
  }

  removeQueryString(url) {
    return url.split(/[?#]/)[0];
  }

  removeExtension(str) {
    debugger;
    const arr = str.split('.');
    if (arr.length == 1) {
      return str;
    }
    return arr.slice(0, -1).join('.')



  }

  getFileNameFromContentDisposition(contentDisposition) {
    if (!contentDisposition || !contentDisposition.includes('filename=')) {
      return "";
    }
    let filename = "";
    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    var matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }

    return filename ? sanitize(filename) : "";
  }

  getFileNameFromContentType(contentType) {

    let extension = mime.extension(contentType)

    const url = this.removeQueryString(this.config.url);
    const fileNameWithoutExtension = this.removeExtension(basename(url));
    return `${sanitize(fileNameWithoutExtension)}.${extension}`;
  }


  /**
   * 
   * @param {string} url 
   * @return {string} fileName
   */
  deduceFileNameFromUrl(url) {
    debugger;
    const cleanUrl = this.removeQueryString(url);
    const baseName = sanitize(basename(cleanUrl));
    return baseName;
    
  }


  /**
   * Deduce the fileName, covering various scenarios.
   * @param {string} url
   * @param {Object} headers
   * @return {string} fileName
   */
  deduceFileName(url, headers) {
    
    
    //First option
    const fileNameFromContentDisposition = this.getFileNameFromContentDisposition(headers['content-disposition'] || headers['Content-Disposition']);
    if (fileNameFromContentDisposition) return fileNameFromContentDisposition;   


    //Second option
    if (extname(url)) {//First check if the url even has an extension
      const fileNameFromUrl = this.deduceFileNameFromUrl(url);
      if (fileNameFromUrl) return fileNameFromUrl;
    }

    //Third option
    const fileNameFromContentType = this.getFileNameFromContentType(headers['content-type'] || headers['Content-Type'])
    if (fileNameFromContentType) return fileNameFromContentType


    //Fallback option
    return sanitize(url)
   

  }
}


