const core = require('@actions/core');
const fs = require('fs');
const readline = require('readline');
const jsYaml = require('js-yaml');
const Ajv = require('ajv');
const { processCatalogInfoFile, setupAjvSchemaValidation } = require('./validate.js');

const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const filename = core.getInput('filename', requiredArgOptions);
const failIfThereAreErrors = core.getBooleanInput('fail-if-errors', requiredArgOptions);
const generateJobSummary = core.getBooleanInput('generate-job-summary', requiredArgOptions);

const OUTPUT_IS_VALID = 'is-valid';
const OUTPUT_ERRORS_MD = 'errors-markdown';

function generateMarkdownFromErrorList(errors, filename) {
  // The errors are set up to be displayed in error annotations,
  // so we need to adjust them slightly for display in markdown
  let errorsString = errors.map(e => `- ${e}`).join('\n');

  let allowedValuesReplacement = `is invalid
  - Allowed values: \*`;
  errorsString = errorsString.replace(/is not one of the allowed values:\n\*/gi, allowedValuesReplacement);

  allowedValuesReplacement = `
  - Allowed values: \*`;
  errorsString = errorsString.replace(/ and must be one of the allowed values:\n\*/gi, allowedValuesReplacement);

  const expectedPatternReplacement = '  - Expected Pattern: `';
  errorsString = errorsString.replace(/Expected Pattern\: '/gi, expectedPatternReplacement).replace(/' e\.g\./gi, '` e.g.');

  const seeSchemaReplacement = `  - See the [catalog info schema`;
  errorsString = errorsString.replace(/See the \[catalog info schema/gi, seeSchemaReplacement);

  errorsString = errorsString.replace(/'/gi, `**`);

  const markdown = `# \`${filename}\` Validation Errors

\`${filename}\` contains the following validation errors:

${errorsString}
`;
  return markdown;
}

function setOutputsForErrors(errors, filename, failIfThereAreErrors) {
  const markdown = generateMarkdownFromErrorList(errors, filename);

  core.setOutput(OUTPUT_ERRORS_MD, markdown);
  core.setOutput(OUTPUT_IS_VALID, false);

  if (generateJobSummary) {
    core.summary.addRaw(markdown, true).write();
  }

  // Print out an errors-markdown file which contains the markdown fragment.
  // This will make it easier to compare expected/actual output.
  fs.writeFile('./errors-markdown.md', markdown, err => {
    if (err) {
      console.error(`An error occurred writing the md to file: ${err}`);
      return;
    }
  });

  if (failIfThereAreErrors) {
    core.setFailed(`${filename} file is invalid`);
  } else {
    core.warning(`${filename} file is invalid`);
  }
}

function isYamlDocJustComments(yamlDoc) {
  const lines = yamlDoc.split('\n');
  for (const line of lines) {
    if (line.trim().length > 0 && !line.trim().startsWith('#') && !line.trim().startsWith('---') && !line.trim().startsWith('...')) {
      return false;
    }
  }
  return true;
}

async function readFileAndPreserveLineNumbers(filename) {
  const fileStream = fs.createReadStream(filename, 'utf8');

  const rl = readline.createInterface({
    input: fileStream,
    // Note: crlfDelay option recognizes all instances of CR LF ('\r\n') in file as a single line break.
    crlfDelay: Infinity
  });

  const END_DOC = '...';
  const NEW_DOC = '---';
  const METADATA = 'metadata:';
  const SPEC = 'spec:';
  const API_VERSION = 'apiVersion:';
  const KIND = 'kind:';

  let i = 0;
  let lines = ['doc: 0'];
  let currentParent = '';
  let catalogInfoText = '';
  let docHasContent = false;
  let hasEndDocLine = false;

  for await (const line of rl) {
    i += 1;
    const formattedLine = line ? line.toLowerCase().trim() : '';

    // If this doc contains a '...' we know our validationMetadata needs to be inserted ahead of it
    // If the doc does not contain '...' validationMetadata should be inserted in front of '---'.
    // Capture which scenario we fall under so we know what signals the end of the doc.
    if (formattedLine === END_DOC) {
      hasEndDocLine = true;
    }

    // If we detect the start of a new doc, insert our validationMetadata block
    // and reset the counters before processing the next document but only if
    // the previous doc actually had content (and wasn't just comments).
    if (formattedLine.startsWith(END_DOC) || (!hasEndDocLine && formattedLine.startsWith(NEW_DOC))) {
      if (docHasContent) {
        catalogInfoText = `${catalogInfoText}
validationMetadata: 
  ${lines.join('\n  ')}`;
      }

      // Reset the info for this doc
      lines = [`doc: ${i + 1}`];
      currentParent = '';
      docHasContent = false;
      hasEndDocLine = false;
    }

    // If there is at least one line that isn't a comment, empty, '...' or '---'  then we know
    // this particular doc has some content & we can add a validationMetadata block to it
    if (!formattedLine.startsWith('#') && formattedLine != NEW_DOC && formattedLine !== END_DOC && formattedLine.length > 0) {
      docHasContent = true;
    }

    if (formattedLine.startsWith(API_VERSION)) {
      lines.push(`apiVersion: ${i}`);
      currentParent = 'apiVersion';
    } else if (formattedLine.startsWith(KIND)) {
      lines.push(`kind: ${i}`);
      currentParent = 'kind';
    } else if (formattedLine.startsWith(METADATA)) {
      lines.push(`metadata: ${i}`);
      currentParent = 'metadata';
    } else if (formattedLine.startsWith(SPEC)) {
      lines.push(`spec: ${i}`);
      currentParent = 'spec';
    } else if (currentParent === 'metadata') {
      if (formattedLine.startsWith('name:')) {
        lines.push(`metadata_name: ${i}`);
      } else if (formattedLine.startsWith('title:')) {
        lines.push(`metadata_title: ${i}`);
      } else if (formattedLine.startsWith('description:')) {
        lines.push(`metadata_description: ${i}`);
      } else if (formattedLine.startsWith('annotations:')) {
        lines.push(`metadata_annotations: ${i}`);
      } else if (formattedLine.startsWith('links:')) {
        lines.push(`metadata_links: ${i}`);
      } else if (formattedLine.startsWith('deployment-environments:')) {
        lines.push(`metadata_deployment_environments: ${i}`);
      } else if (formattedLine.startsWith('addresses:')) {
        lines.push(`metadata_addresses: ${i}`);
      } else if (formattedLine.startsWith('mktp.io/notes:')) {
        lines.push(`metadata_mktp_io_notes: ${i}`);
      } else if (formattedLine.startsWith('mktp.io/owners:')) {
        lines.push(`metadata_mktp_io_owners: ${i}`);
      } else if (formattedLine.startsWith('needs:')) {
        lines.push(`metadata_needs: ${i}`);
      }
    } else if (currentParent === 'spec') {
      if (formattedLine.startsWith('type:')) {
        lines.push(`spec_type: ${i}`);
      } else if (formattedLine.startsWith('system:')) {
        lines.push(`spec_system: ${i}`);
      } else if (formattedLine.startsWith('dependson:')) {
        lines.push(`spec_dependson: ${i}`);
      } else if (formattedLine.startsWith('lifecycle:')) {
        lines.push(`spec_lifecycle: ${i}`);
      } else if (formattedLine.startsWith('consumesapis:')) {
        lines.push(`spec_consumesapis: ${i}`);
      } else if (formattedLine.startsWith('providesapis:')) {
        lines.push(`spec_providesapis: ${i}`);
      } else if (formattedLine.startsWith('definition:')) {
        lines.push(`spec_definition: ${i}`);
      } else if (formattedLine.startsWith('owner:')) {
        lines.push(`spec_owner: ${i}`);
      } else if (formattedLine.startsWith('domain:')) {
        lines.push(`spec_domain: ${i}`);
      } else if (formattedLine.startsWith('subcomponentof:')) {
        lines.push(`spec_subcomponentof: ${i}`);
      }
    }
    catalogInfoText = `${catalogInfoText}
${line}`;
  }

  // Write out the validationMetadata for the final doc (if there was one)
  if (catalogInfoText && catalogInfoText.trim().length > 0 && docHasContent) {
    catalogInfoText = `${catalogInfoText}
validationMetadata: 
  ${lines.join('\n  ')}`;
  }

  // Uncomment if debugging locally and you need to see the line numbers this generated for each section
  // fs.writeFileSync('catalog-info-adjusted.yml', catalogInfoText, err => {
  //   if (err) {
  //     core.setFailed(`An error occurred writing the adjusted catalog-info contents to file: ${err}`);
  //     return;
  //   }
  //   console.log('catalog-info-adjusted.yml written to disk');
  // });

  return catalogInfoText;
}

async function run() {
  const annotationOptions = {
    title: `Catalog Info Validation`,
    file: filename,
    startLine: null
  };

  //If the file doesn't exist, mark as invalid and return
  if (!fs.existsSync(filename)) {
    const errorMsg = `${filename} does not exist.`;
    core.error(errorMsg, annotationOptions);

    setOutputsForErrors([errorMsg], filename, failIfThereAreErrors);
    return;
  }

  // Read the file line by line and add validation metadata which will
  // preserve the original yaml line numbers to use in error reporting.
  const catalogInfoText = await readFileAndPreserveLineNumbers(filename);

  // If the file is empty, mark as invalid and return
  if (!catalogInfoText || catalogInfoText.trim().length === 0) {
    const errorMsg = `${filename} is empty.`;
    core.error(errorMsg, Object.assign(annotationOptions, { startLine: 0 }));

    setOutputsForErrors([errorMsg], filename, failIfThereAreErrors);
    return;
  }

  // If the file is only comments (and doc separators), mark as invalid and return
  if (isYamlDocJustComments(catalogInfoText)) {
    const errorMsg = `${filename} only contains comments.`;
    core.error(errorMsg, Object.assign(annotationOptions, { startLine: 0 }));

    setOutputsForErrors([errorMsg], filename, failIfThereAreErrors);
    return;
  }

  // Validate the contents of catalog-info.yml
  const ajv = setupAjvSchemaValidation(Ajv);

  const repoErrors = await processCatalogInfoFile(core, jsYaml, ajv, catalogInfoText, filename, annotationOptions);
  if (repoErrors.length === 0) {
    core.info(`${filename} file is valid`);
    core.setOutput(OUTPUT_IS_VALID, true);
  } else {
    setOutputsForErrors(repoErrors, filename, failIfThereAreErrors);
  }
}

run();
