# `./test/catalog-infos/invalid-resources.yml` Validation Errors

`./test/catalog-infos/invalid-resources.yml` contains the following validation errors:

- Doc 3, Line 33, `Resource[content-mgmt-db-3]/metadata/deployment-environments` is an array that cannot be empty. It should contain at least one list item or be removed completely if not required.
- Doc 4, Line 45, `Resource[content-mgmt-db-4]/metadata/deployment-environments` must NOT have duplicate items (items 2 and 0 are identical).
- Doc 5, Line 61, `Resource[content-mgmt-db-5]/spec` is an object that cannot be empty. It should contain both system and type properties and may contain optional dependOn and owner props.
- Doc 6, Line 70, `Resource[content-mgmt-db-6]/spec` must have required property **type**.
- Doc 7, Line 82, `Resource[content-mgmt-db-7]/spec/type` value cannot be empty
  - Allowed values: *database, event-hub, app-gateway, front-door, fileshare, resource-group, external*
- Doc 8, Line 93, `Resource[content-mgmt-db-8]/spec/type` value **InvalidResourceType** is invalid
  - Allowed values: *database, event-hub, app-gateway, front-door, fileshare, resource-group, external*
- Doc 9, Line 103, `Resource[content-mgmt-db-9]/spec` must have required property **system**.
- Doc 10, Line 116, `Resource[content-mgmt-db-10]/spec/system` value cannot be empty.
  - Expected Pattern: `system:[<optional-namespace>/]<system-name>` e.g. **system:default/appointment-mananager**, **system:appointment-manager**
- Doc 11, Line 127, `Resource[content-mgmt-db-11]/spec/system` value **content-management** is invalid.
  - Expected Pattern: `system:[<optional-namespace>/]<system-name>` e.g. **system:default/appointment-mananager**, **system:appointment-manager**
- Doc 12, Line 139, `Resource[content-mgmt-db-12]/spec/owner` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 13, Line 151, `Resource[content-mgmt-db-13]/spec/owner` value **customization** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **group:default/customization**, **group:customization**, **user:RyanHauert**, **user:default/RyanHauert**
- Doc 14, Line 163, `Resource[content-mgmt-db-14]/spec/dependsOn` is an array that cannot be empty. It should contain at least one list item or be removed completely if not required.
- Doc 15, Line 175, `Resource[content-mgmt-db-15]/spec/dependsOn/0` value cannot be empty.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **resource:default/launchdarkly**, **component:front-end-tooling-mfe**
- Doc 15, Line 175, `Resource[content-mgmt-db-15]/spec/dependsOn/1` value **content-management-service** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **resource:default/launchdarkly**, **component:front-end-tooling-mfe**
- Doc 15, Line 175, `Resource[content-mgmt-db-15]/spec/dependsOn/2` value **group:default/customization** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **resource:default/launchdarkly**, **component:front-end-tooling-mfe**
