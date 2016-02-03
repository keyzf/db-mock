'use strict';

var _ = require('lodash'),
    path = require('path'),
    logger = require('../logger'),
    utils = require('../utils'),
    userConfig = require('../config/user'),
    dataTypeValidate = require('../data-type-validate'),
    resourcesCollection = require('./resources-collection');

module.exports = function(Resource) {
  Resource.prototype.add = function(resource) {
    var self = this;

    try {
      var object = {};

      // assign ID then tick
      object[userConfig.IDProperty] = self.idTick.get();
      self.idTick.increment();

      // note: going through the schema prunes extra data
      _.each(self.$schema.props({withRelations: false}), function(prop) {
        if (_.isUndefined(resource[prop]) === true) {
          return;
        }
        
        dataTypeValidate(resource, prop, self.$schema[prop].type);
        object[prop] = resource[prop];
      });

      // check $has
      _.each(self.$schema.$has, function(relationResource) {
        var relationResourceProp = relationResource + '_id',
            foreignID = resource[relationResourceProp];

        // if foreign ID is not a number
        if (foreignID && _.isNumber(foreignID) === false) {
          throw new Error('ID reference to ' + relationResource + ' should be of type number');
        }

        // valid foreign ID
        if (_.isNumber(foreignID) === true) {
          var referencedResource = resourcesCollection.of[relationResource].get(foreignID);

          if (_.isNull(referencedResource) === true) {
            throw new Error(relationResource + ' has no object with ID = ' + foreignID);
          } else {
            object[relationResourceProp] = foreignID;
          }
        }
      });

      // write file
      var objPath = path.join(self.$resourceDirPath, object[userConfig.IDProperty] + '.json');
      utils.writeFile(objPath, object);

      // return the newly created obj
      return object;
    } catch (e) {
      logger.error('Failed to save', '(' + self.$name + ')' , e.message);
    }
  };
};