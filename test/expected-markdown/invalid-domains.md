# `./test/catalog-infos/invalid-domains.yml` Validation Errors

`./test/catalog-infos/invalid-domains.yml` contains the following validation errors:

- Doc 3, Line 34, `Domain[cm-domain-3]/spec` is an object that cannot be empty. It should contain both owner and type properties.
- Doc 4, Line 45, `Domain[cm-domain-4]/spec` must have required property **owner**.
- Doc 5, Line 57, `Domain[cm-domain-5]/spec/owner` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 6, Line 69, `Domain[cm-domain-6]/spec/owner` value **content-management** is invalid.
  - Expected Pattern: `<kind>:[<optional-namespace>/]<entity-name>` e.g. **group:default/customization**, **group:customization**, **user:RyanHauert**, **user:default/RyanHauert**
- Doc 7, Line 81, `Domain[cm-domain-7]/spec` must have required property **type**.
- Doc 8, Line 95, `Domain[cm-domain-8]/spec/type` value cannot be empty
  - Allowed values: *Core, External, Generic, Supporting*
- Doc 9, Line 108, `Domain[cm-domain-9]/spec/type` value **invalidThing** is invalid
  - Allowed values: *Core, External, Generic, Supporting*
- Doc 10, Line 111, `Domain[Doc10]` must have required property **metadata**.
- Doc 11, Line 124, `Domain[Doc11]/metadata` is an object that cannot be empty. Metadata is required and should contain the required annotations property and an optional needs property.
- Doc 12, Line 136, `Domain[cm-domain-12]/metadata/annotations` is an object that cannot be empty. Annotations is a map of key-value pairs containing auxiliary information attached to the entity.  For Domains, the **mktp.io/notes** annotation is required and any other annotations are optional.
- Doc 13, Line 149, `Domain[cm-domain-13]/metadata/annotations/mktp.io/notes` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 14, Line 162, `Domain[cm-domain-14]/metadata/annotations/mktp.io/notes` cannot be empty if provided.
- Doc 15, Line 177, `Domain[cm-domain-15]/metadata/annotations/mktp.io/owners` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 16, Line 192, `Domain[cm-domain-16]/metadata/annotations/mktp.io/owners` cannot be empty if provided.
- Doc 17, Line 206, `Domain[cm-domain-17]/metadata/needs` is an object that cannot be empty. Needs is a map of key-value pairs where the key is the string name of the domain that is needed and the value is a string that describes what is needed from that domain.  The key cannot exceed 63 characters and can only contain alphanumeric values including **-**, **_**, and **.**.  The value is a string and markdown is supported.
- Doc 18, Line 220, `Domain[cm-domain-18]/metadata/needs` value **entity-names-can-only-be-63-characters-long-and-this-one-has--64** must NOT have more than 63 characters.
- Doc 19, Line 235, `Domain[cm-domain-19]/metadata/needs/domain-with-inv@lid-ch@rs` is invalid.
  - Expected Pattern: `[a-z0-9A-Z-_.]` e.g. **print-vendor**, **telephony**
- Doc 20, Line 250, `Domain[cm-domain-20]/metadata/needs/print-vendor` is a string that cannot be empty. It should be populated or be removed completely if not required.
- Doc 21, Line 264, `Domain[cm-domain-21]/metadata/needs/print-vendor` cannot be empty if provided.
- Doc 22, Line 279, `Domain[cm-domain-22]/metadata/needs/print-vendor` is a string that cannot be empty. It should be populated or be removed completely if not required.
