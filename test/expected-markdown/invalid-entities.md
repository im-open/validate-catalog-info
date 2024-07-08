# `./test/catalog-infos/invalid-entities.yml` Validation Errors

`./test/catalog-infos/invalid-entities.yml` contains the following validation errors:

- Doc 3, Line 20, `System[content-management-3]` must have required property **apiVersion**.
- Doc 4, Line 28, `System[content-management-4]/apiVersion` value cannot be empty
  - Allowed values: *backstage.io/v1alpha1, backstage.io/v1beta1*
- Doc 5, Line 35, `System[content-management-5]/apiVersion` value **invalid.version.io/v5** is invalid
  - Allowed values: *backstage.io/v1alpha1, backstage.io/v1beta1*
- Doc 6, Line 43, `UnknownKind[content-management-6]` must have required property **kind**.
- Doc 7, Line 53, `UnknownKind[content-management-7]/kind` value cannot be empty
  - Allowed values: *API, Component, Domain, Resource, System*
- Doc 8, Line 60, `Thing[content-management-8]/kind` value **Thing** is invalid
  - Allowed values: *API, Component, Domain, Resource, System*
- Doc 9, Line 67, `System[Doc9]` must have required property **metadata**.
- Doc 10, Line 78, `System[Doc10]/metadata` is an object that cannot be empty. The metadata object requires a name property.
- Doc 11, Line 85, `System[Doc11]/metadata/name` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 12, Line 94, `System[content-management-12]/metadata/title` cannot be empty if provided.
- Doc 13, Line 103, `System[content-management-13]/metadata/annotations` is an object that cannot be empty. The object should be populated with key value pairs containing auxiliary information attached to the entity or be removed completely.
- Doc 14, Line 113, `System[content-management-14]/metadata/links` is an array that cannot be empty. It should contain at least one list item or be removed completely if not required.
- Doc 15, Line 122, `System[content-management-15]/metadata/links/0` must have required property **url**.
- Doc 15, Line 122, `System[content-management-15]/metadata/links/1/url` cannot be empty if provided.
- Doc 15, Line 122, `System[content-management-15]/metadata/links/2/title` cannot be empty if provided.
- Doc 15, Line 122, `System[content-management-15]/metadata/links/3/icon` value cannot be empty
  - Allowed values: *catalog, scaffolder, techdocs, search, chat, dashboard, docs, email, github, group, help, kind:api, kind:component, kind:domain, kind:group, kind:location, kind:system, kind:user, kind:resource, user, warning*
- Doc 15, Line 122, `System[content-management-15]/metadata/links/4/icon` value **description** is invalid
  - Allowed values: *catalog, scaffolder, techdocs, search, chat, dashboard, docs, email, github, group, help, kind:api, kind:component, kind:domain, kind:group, kind:location, kind:system, kind:user, kind:resource, user, warning*
- Doc 16, Line 138, `System[content-management-16]` cannot be extended with additional properties.  **extra-props** should be removed.
