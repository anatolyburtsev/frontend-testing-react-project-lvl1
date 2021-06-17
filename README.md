### Hexlet tests and linter status:
[![Actions Status](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/workflows/hexlet-check/badge.svg)](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions)
[![Lint and Tests](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions/workflows/base-check.yml/badge.svg)](https://github.com/anatolyburtsev/frontend-testing-react-project-lvl1/actions/workflows/base-check.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/701fae47a20a9a7ca6f8/maintainability)](https://codeclimate.com/github/anatolyburtsev/frontend-testing-react-project-lvl1/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/701fae47a20a9a7ca6f8/test_coverage)](https://codeclimate.com/github/anatolyburtsev/frontend-testing-react-project-lvl1/test_coverage)
[![dependencies Status](https://david-dm.org/anatolyburtsev/frontend-testing-react-project-lvl1/status.svg)](https://david-dm.org/anatolyburtsev/frontend-testing-react-project-lvl1)

## Simple usage

```shell
$ npx babel-node bin/page-loader --output /var/tmp https://ru.hexlet.io/courses
```
[![asciicast](https://asciinema.org/a/821Em3xcEIJlbmxjcrXvUyYvA.svg)](https://asciinema.org/a/821Em3xcEIJlbmxjcrXvUyYvA)

## Usage with pictures
```shell
$ npx babel-node bin/page-loader --output /var/tmp https://ru.hexlet.io/courses
```
[![asciicast](https://asciinema.org/a/SDBc9nRKAObUrkq8FnfD1Vaap.svg)](https://asciinema.org/a/SDBc9nRKAObUrkq8FnfD1Vaap)

## Usage with logging
```shell
DEBUG=page-loader npx babel-node bin/page-loader --output /tmp/hexlet https://ru.hexlet.io/u/onotole
```

[![asciicast](https://asciinema.org/a/cUJd2rjAt6CsMazZrmDzZBk4v.svg)](https://asciinema.org/a/cUJd2rjAt6CsMazZrmDzZBk4v)


## run tests with axios debug
```shell
DEBUG=axios make test
```

## run tests with nock debug
```shell
DEBUG=nock.* make test
```
