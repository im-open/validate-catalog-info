# `./test/catalog-infos/invalid-apis.yml` Validation Errors

`./test/catalog-infos/invalid-apis.yml` contains the following validation errors:

- Doc 3, Line 30, `API[content-mgmt-api-3]/spec` is an object that cannot be empty. It should contain definition, lifecycle, system, and type properties and may contain an optional owner prop.
- Doc 4, Line 39, `API[content-mgmt-api-4]/spec` must have required property **type**.
- Doc 5, Line 54, `API[content-mgmt-api-5]/spec/type` value cannot be empty
  - Allowed values: *openapi, asyncapi*
- Doc 6, Line 68, `API[content-mgmt-api-6]/spec/type` value **myapi** is invalid
  - Allowed values: *openapi, asyncapi*
- Doc 7, Line 81, `API[content-mgmt-api-7]/spec` must have required property **lifecycle**.
- Doc 8, Line 97, `API[content-mgmt-api-8]/spec/lifecycle` value cannot be empty
  - Allowed values: *experimenting, developing, maintaining, deprecating, obsolete*
- Doc 9, Line 111, `API[content-mgmt-api-9]/spec/lifecycle` value **mylifecycle** is invalid
  - Allowed values: *experimenting, developing, maintaining, deprecating, obsolete*
- Doc 10, Line 123, `API[content-mgmt-api-8]/spec` must have required property **system**.
- Doc 11, Line 140, `API[content-mgmt-api-11]/spec/system` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 12, Line 154, `API[content-mgmt-api-11]/spec/system` value **content-management** is invalid.
  - Expected Pattern: `system:[<optional-namespace>/]<system-name>` e.g. **system:default/appointment-manager**, **system:appointment-manager**
- Doc 13, Line 169, `API[content-mgmt-api-13]/spec/owner` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 14, Line 187, `API[content-mgmt-api-14]/spec/owner` value **customization** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **group:default/ce2**, **group:ce2**, **user:RyanHauert**, **user:default/RyanHauert**
- Doc 15, Line 198, `API[content-mgmt-api-15]/spec` must have required property **definition**.
- Doc 16, Line 216, `API[content-mgmt-api-16]/spec/definition` Is required and must be a string or an object with a $text, $json, or $yaml property.
  - See the [catalog info schema](https://github.com/im-open/validate-catalog-info/blob/main/schema/CatalogInfo.schema.json) for details and examples.
- Doc 17, Line 220, `API[content-mgmt-api-17]/metadata/addresses` is an object that cannot be empty. Addresses should be have one or more domains as the property name and a corresponding list of address objects as the value for each domain property.
- Doc 18, Line 235, `API[content-mgmt-api-18]/metadata/addresses/mktp.io` is an array that cannot be empty. It should contain at least one list item or be removed completely if not required.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/0/subdomain` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/1/path` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/2/envs` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/3/subdomain` cannot be empty if provided.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/4/path` cannot be empty if provided.
- Doc 19, Line 251, `API[content-mgmt-api-19]/metadata/addresses/mktp.io/5/envs` cannot be empty if provided.
