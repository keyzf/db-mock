'use strict';

var fs = require('fs'),
    rimraf = require('rimraf'),
    _ = require('lodash'),
    logger = require('./logger');

function mkDir(path, options) {
  options = _.defaults(options, {
    cleanIfExist: false
  });

  try {
    fs.mkdirSync(path);
    logger.info(path, 'created');
  } catch (e) {
    if (e.code === 'EEXIST') {
      logger.info(path, 'already exists');

      if (options.cleanIfExist === true) {
        rimraf.sync(path); // remove folder first
        fs.mkdirSync(path);
        logger.info(path, 'cleaned');        
      }
    } else {
      logger.error('can\'t create dir:', path);
    }
  }
}

function readFile(path, options) {
  options = _.defaults(options, {
    json: true,
    failSoft: false
  });

  try {
    var file = fs.readFileSync(path);

    if (options.json) {
      file = JSON.parse(file);
    }

    logger.info('read', path);
    return file;
  } catch (e) {
    if (options.failSoft) {
      return false;
    } else {
      throw e;
    }
  }
}

function writeFile(path, data, options) {
  options = _.defaults(options, {
    json: true
  });

  try {
    if (options.json) {
      data = JSON.stringify(data, null, 4);
    }

    fs.writeFileSync(path, data);
    logger.info('write', path);
  } catch (e) {
    logger.error('can\'t write file', path);
  }
}

function getFileName(ID) {
  ID = ID + '';

  while(ID.length < 6) {
    ID = '0' + ID;
  }

  return ID + '.json';
}

module.exports = {
    mkDir: mkDir,
    readFile: readFile,
    writeFile: writeFile,
    getFileName: getFileName
};