#!/usr/bin/env node

import pkg from 'commander';
import pageLoader from '../src/pageLoader.js';

const { program } = pkg;

program
  .version('0.0.1')
  .description('Create local copy of internet page')
  .arguments('<url>')
  .option('-o, --output [path]', 'output directory', process.cwd())
  .action(async (url, options) => {
    try {
      const { filepath } = await pageLoader(url, options.output);
      console.log(filepath);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });

program.parse();
