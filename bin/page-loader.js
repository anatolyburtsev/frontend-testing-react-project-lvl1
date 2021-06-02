#!/usr/bin/env node

import pkg from 'commander';
import pageLoader from '../src/pageLoader.js';

const { program } = pkg;

program
  .version('0.0.1')
  .description('Create local copy of internet page')
  .arguments('<url>')
  .option('-o, --output [path]', 'output directory', process.cwd())
  .action((url, options) => {
    pageLoader(url, options.output);
  });

program.parse();
