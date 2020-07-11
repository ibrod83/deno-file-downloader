deno-file-downloader is a simple utility for downloading files. It hides the complexity of dealing with streams, paths and duplicate file names. Based on [nodejs-file-downloader](https://ibrod83.github.io/nodejs-file-downloader/)

This is an early release. Tested on Deno 1.1.3, Windows.

# Table of Contents
- [Examples](#examples)     
  * [Basic](#basic)   
  * [Custom file name](#custom-file-name)  
  * [Overwrite existing files](#overwrite-existing-files)  

## Examples
#### Basic

Download a large file with default configuration

```javascript

const downloader = new Downloader({     
  url: 'http://212.183.159.230/200MB.zip',//If the file name already exists, a new file with the name 200MB1.zip is created.     
  directory: "./downloads",//This folder will be created, if it doesn't exist.               
})

await downloader.download();//Downloader.download() returns a promise.

console.log('All done');



```

&nbsp;

#### Custom file name

nodejs-file-downloader "deduces" the file name, from the URL or the response headers. If you want to overwrite it, supply a config.fileName property.

```javascript

  const downloader = new Downloader({     
      url: 'http://212.183.159.230/200MB.zip',     
      directory: "./downloads/2020/May", 
      fileName:'somename.zip'//This will be the file name.        
  }) 

  await downloader.download();


```

&nbsp;

#### Overwrite existing files

By default, nodejs-file-downloader uses config.cloneFiles = true, which means that files with an existing name, will have a number appended to them.

```javascript

  const downloader = new Downloader({     
      url: 'http://212.183.159.230/200MB.zip',     
      directory: "./",  
      cloneFiles:false//This will cause the downloader to re-write an existing file.   
  }) 

  await downloader.download();


```

&nbsp;
