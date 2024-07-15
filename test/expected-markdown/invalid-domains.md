# `./test/catalog-infos/invalid-domains.yml` Validation Errors

`./test/catalog-infos/invalid-domains.yml` contains the following validation errors:

- Doc 3, Line 26, `Domain[cm-domain-3]/spec` is an object that cannot be empty. It should contain both owner and type properties.
- Doc 4, Line 35, `Domain[cm-domain-4]/spec` must have required property **owner**.
- Doc 5, Line 45, `Domain[cm-domain-5]/spec/owner` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 6, Line 55, `Domain[cm-domain-6]/spec/owner` value **content-management** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **group:default/customization**, **group:customization**, **user:RyanHauert**, **user:default/RyanHauert**
- Doc 7, Line 65, `Domain[cm-domain-7]/spec` must have required property **type**.
- Doc 8, Line 77, `Domain[cm-domain-8]/spec/type` value cannot be empty
  - Allowed values: *Core, External, Generic, Supporting*
- Doc 9, Line 88, `Domain[cm-domain-9]/spec/type` value **invalidThing** is invalid
  - Allowed values: *Core, External, Generic, Supporting*
