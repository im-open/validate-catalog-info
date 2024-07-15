const catalogInfoSchema = require('../schema/CatalogInfo.schema.json');
const apiSchema = require('../schema/API.v1alpha1.schema.json');
const componentSchema = require('../schema/Component.v1alpha1.schema.json');
const domainSchema = require('../schema/Domain.v1alpha1.schema.json');
const resourceSchema = require('../schema/Resource.v1alpha1.schema.json');
const systemSchema = require('../schema/System.v1alpha1.schema.json');
const entitySchema = require('../schema/Entity.schema.json');

const SCHEMA_URL = 'https://github.com/im-open/validate-catalog-info-file/blob/main/schema/CatalogInfo.schema.json';
const API_SCHEMA_URL = 'https://github.com/im-open/validate-catalog-info-file/blob/main/schema/API.v1alpha1.schema.json';

function setupAjvSchemaValidation(Ajv) {
  // If allErrors is not set, the validator will stop once the first validation error occurrs
  const ajv = new Ajv({
    allErrors: true,
    async: true,
    verbose: true,
    unicodeRegExp: false
  });

  ajv.addSchema(catalogInfoSchema, 'root');
  ajv.addSchema(entitySchema, 'entity');
  ajv.addSchema(apiSchema, 'api');
  ajv.addSchema(componentSchema, 'component');
  ajv.addSchema(domainSchema, 'domain');
  ajv.addSchema(resourceSchema, 'resource');
  ajv.addSchema(systemSchema, 'system');

  // Schema compilation happens on the first API call, not when they are added.  So make a
  // call here to force it to compile, so when we go to validate it doesn't need to do it.
  // The first call can be "slow" so fire it off now, rather than when we need it to be fast.
  ajv.getSchema('root');

  return ajv;
}

function getValidateFunctionForDocKind(kind, ajv) {
  // If the kind is empty ajv should still produce an error indicating kind
  // is missing.  In the meantime, do some basic entity-level validation
  // to catch any additional errors that might be there.
  const entityKind = kind || 'entity';

  try {
    return ajv.getSchema(entityKind.toLowerCase());
  } catch (error) {
    return 'null';
  }
}

function getYamlLineNumberOfError(errorPath, jsonDoc) {
  // This sometimes happens at the root level of the doc
  if (!errorPath) {
    return jsonDoc.validationMetadata.doc;
  }

  // When errors in arrays (dependsOn, links, etc.) are reported, we need to split
  // the path and get the array name so we can look up that line number because line
  // numbers of individual array items are not provided.  For instance:
  //    errorPath: /metadata/links/0/icon => /metadata/links
  //    errorPath: /metadata/deployment-environments/0 => /metadata/deployment-environments
  const objArrayRegex = /\/\d{1,3}\/*.*/i;
  const errorObj = errorPath.replace(objArrayRegex, '');

  // The error message will be reported as a path with slashes but we need to convert
  // it to the same format that the validationMetadata props are stored in when the
  // file is loaded so we can look up the correct line number.  For instance:
  // errorObj: /metadata/links
  // propName: metadata_links
  const propName = errorObj // The name of the prop or array
    .substring(1, errorPath.length) // Remove the leading /
    .replace(/\//gi, '_') // Change all / to _
    .replace(/-/gi, '_') // Change - to _
    .toLowerCase(); // Change everything to lower (just in case)

  // If we process it and can't find the right line, default to using the line number
  // of the doc.  This may happen if new items are added to the schema but the intial
  // loading function that preserves line numbers from the yaml file hasn't been updated.
  const lineNumber = jsonDoc.validationMetadata[propName] || jsonDoc.validationMetadata.doc;
  return lineNumber;
}

function removeDuplicateishErrorFromList(errorsList, baseMsg) {
  const errorToRemove = errorsList.find(e => e.message.startsWith(baseMsg));
  if (errorToRemove) {
    errorsList = errorsList.filter(e => e != errorToRemove);
  }
  return errorsList;
}

function isErrorDataPresent(ajvErrorData) {
  let type = typeof ajvErrorData;

  switch (type) {
    case 'string':
      return ajvErrorData && ajvErrorData.trim().length > 0;
    case 'object':
      return ajvErrorData !== null && ajvErrorData !== undefined;
    default:
      return false;
  }
}

async function validateSingleDoc(doc, docId, docCount, ajv) {
  let errorsList = [];
  let validateWithAjvFunc = getValidateFunctionForDocKind(doc.kind, ajv);
  if (!validateWithAjvFunc) {
    validateWithAjvFunc = getValidateFunctionForDocKind('entity', ajv);
  }

  const isValidAccordingToAjv = await validateWithAjvFunc(doc);
  if (isValidAccordingToAjv) return [];

  for (const ajvError of validateWithAjvFunc.errors) {
    const lineNumber = getYamlLineNumberOfError(ajvError.instancePath, doc);
    const itemId = `Doc ${docCount}, Line ${lineNumber}, \`${docId}${ajvError.instancePath}\``;
    const schemaComment = ajvError.parentSchema && ajvError.parentSchema.$comment ? ajvError.parentSchema.$comment : null;
    const hasData = isErrorDataPresent(ajvError.data);

    switch (ajvError.keyword) {
      case 'enum':
        // There are generally two errors that pop up when an enum value is empty, so remove the first
        // 'string cannot be empty' message since this 'not one of the allowed values' message covers it.
        const msgStart = `${itemId} is a string that cannot be empty.`;
        errorsList = removeDuplicateishErrorFromList(errorsList, msgStart);

        const invalidPart = hasData ? `'${ajvError.data}' is not` : 'cannot be empty and must be';
        const enumMessage = `${itemId} value ${invalidPart} one of the allowed values:\n*${ajvError.params.allowedValues.join(', ')}*`;
        errorsList.push({ line: lineNumber, message: enumMessage });
        break;
      case 'type':
        if (ajvError.instancePath === '/spec/definition') {
          // spec/definition is a special case where if it is missing there will be 5 errors reported:
          //   - 1 saying it must be a non-empty string       (keyword=type)
          //   - 3 saying it must be a non-empty object       (keyword=type)
          //   - 1 saying it must be one of the defined types (keyword=anyOf)
          // We don't need 5 errors reported for the same path and reporting 5 eats into our annotation
          // allowance (10 per step).  Skip these 'type' errors and just report the 'anyOf' error.
          continue;
        }

        let typeMessage;
        if (ajvError.message === 'must be object') {
          const baseMsg = `${itemId} is an object that cannot be empty`;
          if (schemaComment) {
            // If an empty obj message was already added for this path, remove it since this msg is more specific.
            errorsList = removeDuplicateishErrorFromList(errorsList, baseMsg);
            typeMessage = `${baseMsg}. ${schemaComment}`;
          } else {
            typeMessage = `${baseMsg}. It should contain at least one property or be removed completely if not required.`;
          }
        } else if (ajvError.message === 'must be array') {
          typeMessage = `${itemId} is an array that cannot be empty. It should contain at least one list item or be removed completely if not required.`;
        } else if (ajvError.message === 'must be string') {
          typeMessage = `${itemId} is a string that cannot be empty. It should be populated or be removed completely if not required.`;
        } else if (ajvError.message === 'must be integer') {
          typeMessage = `${itemId} is an integer that cannot be empty. It should be populated or be removed completely if not required.`;
        } else {
          typeMessage = `Unhandled type.message: ${itemId} | ${ajvError.data} | ${ajvError.message}`;
        }
        errorsList.push({ line: lineNumber, message: typeMessage });
        break;
      case 'required':
        errorsList.push({ line: lineNumber, message: `${itemId} must have required property '${ajvError.params.missingProperty}'.` });
        break;
      case 'minLength':
        if (hasData) {
          errorsList.push({ line: lineNumber, message: `${itemId} value '${ajvError.data}' ${ajvError.message}.` });
        } else {
          errorsList.push({ line: lineNumber, message: `${itemId} cannot be empty if provided.` });
        }
        break;
      case 'maxLength':
        errorsList.push({ line: lineNumber, message: `${itemId} value '${ajvError.data}' ${ajvError.message}.` });
        break;
      case 'anyOf':
        const url = doc.kind === 'api' ? API_SCHEMA_URL : SCHEMA_URL;
        const oneOfMessage = `${itemId} ${schemaComment}\nSee the [catalog info schema](${url}) for details and examples.`;
        errorsList.push({ line: lineNumber, message: oneOfMessage });
        break;
      case 'pattern':
        const examples = ajvError.parentSchema.examples.join(`', '`);
        const errorSnippet = hasData ? `'${ajvError.data}' is invalid` : 'cannot be empty';
        const patternMessage = `${itemId} value ${errorSnippet}.\n${schemaComment} e.g. '${examples}'`;
        errorsList.push({ line: lineNumber, message: patternMessage });
        break;
      case 'uniqueItems':
        errorsList.push({ line: lineNumber, message: `${itemId} ${ajvError.message.replace('## ', '')}.` });
        break;
      case 'additionalProperties':
        const additionalMsg = `${itemId} cannot be extended with additional properties.  '${ajvError.params.additionalProperty}' should be removed.`;
        errorsList.push({ line: lineNumber, message: additionalMsg });
        break;
      default:
        errorsList.push({ line: lineNumber, message: `Unhandled keyword - ${itemId} | ${ajvError.data} | ${ajvError.message}` });
        break;
    }
  }
  return errorsList;
}

async function processCatalogInfoFile(core, jsYaml, ajv, catalogInfoTextAsYaml, filename, annotationOptions) {
  // This will take the entire contents of catalog-info.yml (which can contain
  // multiple yaml docs) and convert them into an array of json docs (which
  // represent catalog-info entities) and will process them individually with ajv
  let catalogInfoDocs;
  try {
    catalogInfoDocs = jsYaml.loadAll(catalogInfoTextAsYaml);
  } catch (error) {
    const errorMessage = `An error occurred converting the file to json: ${error.message}`;
    core.error(errorMessage, Object.assign(annotationOptions, { startLine: 0 }));
    return [errorMessage];
  }

  const numDocs = catalogInfoDocs.length;
  core.info(`${filename} contains ${numDocs} ${numDocs > 1 ? 'docs' : 'doc'}`);

  // Validate each doc inside of catalog-info.yml file against the
  // schema and any additional validation logic we create
  const allCatalogInfoErrors = [];
  let docCount = 0;
  for (const doc of catalogInfoDocs) {
    docCount += 1;
    try {
      // If this is empty, it is most likely just comments that could not be converted to json
      if (!doc) {
        core.info(`\nValidating Doc #${docCount}\nDoc #${docCount} only contains comments.`);
        continue;
      }

      // Setup a doc id that we can use to make more informative error messages
      const kind = doc.kind || `UnknownKind`;
      const name = doc.metadata && doc.metadata.name ? doc.metadata.name : `Doc${docCount}`;
      const docId = `${kind}[${name}]`;

      // Now do the actual validation against the schema
      core.info(`\nValidating Doc #${docCount} - ${docId}`);

      // Gather the errors from ajv and create error annotations as necessary
      const validationErrors = await validateSingleDoc(doc, docId, docCount, ajv);
      if (validationErrors.length > 0) {
        core.warning(`Doc #${docCount} is invalid`);
        validationErrors.forEach(error => {
          if (!allCatalogInfoErrors.includes(error.message)) {
            allCatalogInfoErrors.push(error.message);
            const plainErrorMessage = error.message.replace(/`/g, '').replace(/'/g, '').replace(/\*/g, '');
            core.error(plainErrorMessage, Object.assign(annotationOptions, { startLine: error.line }));
          }
        });
      } else {
        core.info(`Doc #${docCount} is valid`);
      }
    } catch (error) {
      core.warning(`Doc #${docCount} is invalid: ${error.message}`);
      allCatalogInfoErrors.push(error.message);
    }
  }

  // After the individual docs are processed, we can indicate whether
  // the whole catalog-info.yml is valid or not
  core.info(`\nFinished processing ${filename}`);
  return allCatalogInfoErrors;
}

module.exports = {
  setupAjvSchemaValidation,
  processCatalogInfoFile
};
