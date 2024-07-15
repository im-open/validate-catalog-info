# `./test/catalog-infos/invalid-systems.yml` Validation Errors

`./test/catalog-infos/invalid-systems.yml` contains the following validation errors:

- Doc 3, Line 24, `System[content-management-3]/spec` is an object that cannot be empty. It should contain at least one optional domain or owner property or be removed completely.
- Doc 4, Line 33, `System[content-management-4]/spec/owner` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 5, Line 42, `System[content-management-5]/spec/owner` value **content-management** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **group:default/customization**, **group:customization**, **user:RyanHauert**, **user:default/RyanHauert**
- Doc 6, Line 51, `System[content-management-6]/spec/domain` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 7, Line 60, `System[content-management-7]/spec/domain` value **content-management-domain** is invalid.
  - Expected Pattern: `domain:[<optional-namespace>/]<domain-name>` e.g. **domain:default/front-end-tooling**, **domain:content-management**
