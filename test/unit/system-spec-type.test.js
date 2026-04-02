const { before, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const { setupAjvSchemaValidation } = require('../../src/validate.js');

describe('System spec.type', () => {
  let validate;

  before(() => {
    const ajv = setupAjvSchemaValidation(Ajv);
    validate = ajv.getSchema('system');
    assert.ok(validate, 'compiled system schema should exist');
  });

  function systemDoc(spec) {
    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: { name: 'test-system' },
      spec
    };
  }

  test('omitted spec.type is valid', async () => {
    const ok = await validate(systemDoc({ owner: 'group:default/customization' }));
    assert.equal(ok, true);
  });

  test('spec.type bounded-context is valid', async () => {
    const ok = await validate(systemDoc({ type: 'bounded-context', owner: 'group:default/customization' }));
    assert.equal(ok, true);
  });

  test('spec.type product is valid', async () => {
    const ok = await validate(systemDoc({ type: 'product', owner: 'group:default/customization' }));
    assert.equal(ok, true);
  });

  test('spec.type null is valid', async () => {
    const ok = await validate(systemDoc({ type: null, owner: 'group:default/customization' }));
    assert.equal(ok, true);
  });

  test('disallowed spec.type string is invalid', async () => {
    const ok = await validate(systemDoc({ type: 'service', owner: 'group:default/customization' }));
    assert.equal(ok, false);
  });
});
