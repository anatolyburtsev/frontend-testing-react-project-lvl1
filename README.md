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
[![asciicast](https://asciinema.org/a/qnXG7IBTkrSHmNDJCad9kVqx8.svg)](https://asciinema.org/a/qnXG7IBTkrSHmNDJCad9kVqx8)

## Usage with logging
```shell
DEBUG=page-loader npx babel-node bin/page-loader --output /tmp/hexlet https://ru.hexlet.io/u/onotole
```

[![asciicast](https://asciinema.org/a/0DMRYm78NXohtC7bS4sXhJgfV.svg)](https://asciinema.org/a/0DMRYm78NXohtC7bS4sXhJgfV)

## Error presenting
[![asciicast](https://asciinema.org/a/GIOTZ9IRP4f4rl5gHYETrdloB.svg)](https://asciinema.org/a/GIOTZ9IRP4f4rl5gHYETrdloB)

## run tests
```shell
make test
```

[![asciicast](https://asciinema.org/a/7te6BNBLdaNU7Ud8U4Y32jcv9.svg)](https://asciinema.org/a/7te6BNBLdaNU7Ud8U4Y32jcv9)


## run tests with full debug
```shell
DEBUG=axios,nock.*,page-loader make test
```
[![asciicast](https://asciinema.org/a/TPE5aaX96bsaKuniOr360Yih4.svg)](https://asciinema.org/a/TPE5aaX96bsaKuniOr360Yih4)
