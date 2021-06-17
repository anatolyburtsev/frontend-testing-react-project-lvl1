### Hexlet tests and linter status:
[![Actions Status](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/workflows/hexlet-check/badge.svg)](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions)
[![Lint and Tests](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions/workflows/base-check.yml/badge.svg)](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions/workflows/base-check.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/701fae47a20a9a7ca6f8/maintainability)](https://codeclimate.com/github/anatolyburtsev/frontend-testing-react-project-lvl1/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/701fae47a20a9a7ca6f8/test_coverage)](https://codeclimate.com/github/anatolyburtsev/frontend-testing-react-project-lvl1/test_coverage)
[![dependencies Status](https://david-dm.org/anatolyburtsev/frontend-testing-react-project-lvl1/status.svg)](https://david-dm.org/anatolyburtsev/frontend-testing-react-project-lvl1)

## Usage

```shell
$ npx babel-node bin/page-loader --output /var/tmp https://ru.hexlet.io/courses
```
[![asciicast](https://asciinema.org/a/Ul9zYCVhJnqN1rquPIvx1SAwd.svg)](https://asciinema.org/a/Ul9zYCVhJnqN1rquPIvx1SAwd)

## Usage with logging
```shell
DEBUG=page-loader npx babel-node bin/page-loader --output /tmp/hexlet https://ru.hexlet.io/u/onotole
```

[![asciicast](https://asciinema.org/a/cUJd2rjAt6CsMazZrmDzZBk4v.svg)](https://asciinema.org/a/cUJd2rjAt6CsMazZrmDzZBk4v)

## Error presenting
[![asciicast](https://asciinema.org/a/ta8SnD2tqzDhDUY2u2meKCj3c.svg)](https://asciinema.org/a/ta8SnD2tqzDhDUY2u2meKCj3c)

## run tests with full debug
```shell
DEBUG=axios,nock.*,page-loader make test
```
