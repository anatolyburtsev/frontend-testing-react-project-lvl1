#!/usr/bin/env node

import pkg from 'commander';
import pageLoader from '../src/index.js';

const { program } = pkg;

program
  .version('0.0.1')
  .description('Create local copy of internet page')
  .arguments('<url>')
  .option('-o, --output [path]', 'output directory', process.cwd())
  .action(async (url, options) => {
    try {
      const { filepath } = await pageLoader(url, options.output);
      console.log(`page successfully saved to ${filepath}`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program.parse();
