# validate-catalog-info-file

This action validates the contents of a `catalog-info.yml` file.  This action can be used during CI or other workflows to ensure the ongoing validity of the file.  

The action uses the files defined in the [schema] directory for validation.

> [!NOTE]
> The action does require the `catalog-info.yml` file to exist on disk prior to running this validation action.

The action creates [error annotations] for every validation error it finds and a [warning annotation] for each invalid yaml document inside the `catalog-info.yml`.  GitHub has [annotation limits]  of 10 error and 10 warning annotations per step though, so only 10 errors and 10 warnings will can be shown on the `catalog-info.yml` file or on the workflow summary.  The workflow log still shows all errors.  

To address the limitation with the number of annotations, an `errors-markdown` output is available with the generated markdown for all errors detected in the file.  A job summary is created automatically with the same markdown unless `generate-job-summary` is set to `false`.

## Index <!-- omit in toc -->

- [validate-catalog-info-file](#validate-catalog-info-file)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
    - [Incrementing the Version](#incrementing-the-version)
    - [Source Code Changes](#source-code-changes)
    - [Recompiling Manually](#recompiling-manually)
    - [Updating the README.md](#updating-the-readmemd)
    - [Tests](#tests)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)

## Inputs

| Parameter              | Is Required | Default              | Description                                                                                                                                                                                                                                                                                          |
|------------------------|-------------|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`             | false       | `./catalog-info.yml` | The name of the `catalog-info.yml` file.                                                                                                                                                                                                                                                             |
| `fail-if-errors`       | false       | true                 | Error annotations are created for each validation error in the `catalog-info.yml` file but these errors won't cause the action to fail on their own.  If this flag is set the action will be marked as a failure if the `catalog-info.yml` file is missing, empty or contains any validation errors. |
| `generate-job-summary` | false       | true                 | Flag that determines whether a job summary containing validation errors will be created.<ul><li>Only applicable when the file is invalid.</li><li>This is the same markdown data that is provided in the `errors-markdown` output.</li></ul>                                                         |

## Outputs

| Output            | Description                                                                                                                                                                                                           | Possible Values |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `is-valid`        | A flag indicating whether the `catalog-info.yml` file is valid or not.                                                                                                                                                | true or false   |
| `errors-markdown` | A markdown fragment containing the list of all validation errors in the `catalog-info.yml` file.  output is provided because GitHub limits the number of error annotations that can be created in a single run to 10. | true or false   |

## Usage Examples

```yml
jobs:
  validate-catalog-info:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Validate catalog-info.yml
        id: catalogInfo
        uses: im-open/validate-catalog-info-file@v1.0.0
        with:
          filename: ./docs/catalog-info.yml # Defaults to ./catalog-info.yml
          fail-if-errors: false             # Defaults to true
          generate-job-summary: false       # Defaults to true

      - name: Add PR comment if catalog-info.yml is invalid
        if: steps.catalogInfo.outputs.is-valid == 'false'
        uses: im-open/update-pr-comment@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # Special per-job token generated by GH for interacting with the repo
          comment-identifier: catalog-info-errors
          comment-content: ${{ steps.catalogInfo.outputs.errors-markdown }}
```

## Contributing

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.
- [ ] Any tests in the [build-and-review-pr] workflow are passing

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
|----------------|---------------------------------------------|
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.  

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

### Tests

The build and review PR workflow includes tests which are linked to a status check. That status check needs to succeed before a PR is merged to the default branch.  When a PR comes from a branch, there should not be any issues running the tests. When a PR comes from a fork, tests may not have the required permissions or access to run since the `GITHUB_TOKEN` only has `read` access set for all scopes. Also, forks cannot access other secrets in the repository.  In these scenarios, a fork may need to be merged into an intermediate branch by the repository owners to ensure the tests run successfully prior to merging to the default branch.

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2023, Extend Health, LLC. Code released under the [MIT license](LICENSE).

 <!-- Links -->
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[source code]: #source-code-changes
[Updating the README.md]: #updating-the-readmemd
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
[schema]: ./schema/CatalogInfo.schema.json
[error annotations]: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#example-creating-an-annotation-for-an-error
[warning annotation]: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
[annotation limits]: https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md#limitations
