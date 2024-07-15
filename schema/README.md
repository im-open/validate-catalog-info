# Catalog Info Schema

These json schemas represent the format of our `catalog-info.yml` files.  The schema is very similar to Backstage's implementation but more strict when it comes to entity references.  In IM's schema, any entity reference requires the `kind` part to be included.  Backstage does not require the `kind` part in all cases.

These schema files are used both to validate `catalog-info.yml` files in the `validate-catalog-info` action and in IDEs that support associating a schema with file types for validation.

## Index <!-- omit in toc -->

- [Catalog Info Schema](#catalog-info-schema)
  - [When Making Any Changes](#when-making-any-changes)
  - [When Adding or Updating `object` Types](#when-adding-or-updating-object-types)
  - [Adding or Updating `required` Prop](#adding-or-updating-required-prop)
  - [Adding or Updating `pattern` Prop](#adding-or-updating-pattern-prop)
  - [When Adding or Updating `enum` Prop](#when-adding-or-updating-enum-prop)
  - [Considerations for `minLength`](#considerations-for-minlength)

## When Making Any Changes

Changes should be made in the [Entity.schema.json] if they apply to all entity types.  Changes should be made in the other schema files if they only affect the corresponding entity type.  Items that are defined in [Entity.schema.json] should not be repeated in the other entity files.

See ajv's [JSON Schema] for details on what properties & functionality are compatible with the action's validation functionality.

If new properties are added, removed, or modified the [catalog-info input files] should be updated to reflect those changes.

The corresponding [expected-markdown] output may need to be regenerated as well.  This can be done by:

1. Uncommenting the block of code that writes a markdown snippet to file
1. Running the action locally with the filename set to the modified test file
1. Verifying the new markdown looks correct
1. Replacing the contents in the expected markdown file with the newly generated snippet.

## When Adding or Updating `object` Types

When a new property with type `object` is added, it should have a corresponding `$comment` prop explaining the expected format and providing context.  For instance:

```json
  # Schema File
  "spec": {
    "type": "object",
    "$comment": "It should contain both system and type properties and may contain optional dependOn and   owner props."
  },
```

The `$comment` prop is used in conjuntion with the action to provide detailed error messages like this:

```md
  # Action Output
  Doc 5, Line 61, 'Resource[content-mgmt-db-5]/spec' is an object that cannot be empty. 
  It should contain both system and type properties and may contain optional dependOn and owner props.
```

## Adding or Updating `required` Prop

See [considerations for `minLength`] when using the `required` prop.

## Adding or Updating `pattern` Prop

When a `pattern` is added to a property, corresponding `$comment` and `examples` properties should be added that states the pattern and examples of that pattern.  For instance:

```json
# Schema File
  "pattern": "\\b(?:component)\\b:(?:\\bdefault\\/\\b)?.+",
  "$comment": "Expected Pattern: 'component:[<optional-namespace>/]<component-name>'",
  "examples": [
    "component:default/discover-mfe",
    "component:discover-mfe"
  ]
```

The `$comment` and `examples` properties are used in conjuntion with the action to provide detailed error messages like this:

```md
  # Action Output
  Doc 18, Line 229, 'Component[content-mfe-18]/spec/subcomponentOf' value **content-management-db** is invalid.
  Expected Pattern: component:[<optional-namespace>/]<component-name>
  e.g. 'component:default/discover-mfe', 'component:discover-mfe'
```

Also, see [considerations for `minLength`] when using the `pattern` prop.

## When Adding or Updating `enum` Prop

Any item with an `enum` type does not need an `examples` prop or a `minLength` prop.  The IDE will correctly tells users the allowed values based on what is defined in the `enum`.  When the `examples` prop is included, it just adds verbosity.  

Also, see [considerations for `minLength`] when using the `enum` prop.

## Considerations for `minLength`

In many cases the `minLength: 1` is not necessary because other properties apply that inherently.  Including the `minLength: 1` prop in those scenarios generates an additional error message which eats up the [annotation limits].  In the following cases it is best to fall back to the other props and omit the `minLength` prop altogether:

- When an `enum` prop is defined, the value cannot be empty because it must be one of the defined values
- When a `pattern` prop requires a value, it must conform to the regex defined, including any length requirements
- When a prop is included in the `required` list it cannot be empty and must have a length > 0

<!-- links -->
[catalog-info input files]: ./test/catalog-infos
[expected-markdown]: ./test/expected-markdown
[annotation limits]: https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md#limitations
[considerations for `minLength`]: #considerations-for-minlength
[Entity.schema.json]: ./Entity.schema.json
[JSON Schema]: https://ajv.js.org/json-schema.html