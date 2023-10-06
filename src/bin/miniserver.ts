#!/usr/bin/env node

import * as fs from 'fs';
import path from 'path';
import { exec, execSync, spawn } from 'child_process';

const servicesConfigFile = 'servicesconfig.json';
const buildDir = '.miniserver';
const argv = process.argv;

if (argv[2] === 'start') {
  execSync(`rm -rf ${buildDir} && tsc --outDir "${buildDir}"`);

  const fileContent = `import * as service from '@mavvy/miniserver';
import path from 'path';
import models from './models.js'; 

const init = async () => {
  const servicesFile = await service.utils.importFile(path.join(process.cwd(), '${servicesConfigFile}'));
  const handlers = await service.utils.link(process.cwd(), '${buildDir}/handlers');

  service.server.serve(models, handlers, servicesFile);
}

init();
`;
  const filePath = path.join(buildDir, 'index.js');

  fs.writeFileSync(filePath, fileContent);

  const runner = spawn(`node ${buildDir}/index.js`, { shell: true });

  runner.stdout.on('data', (data) => console.log(data.toString()));
  runner.stderr.on('data', (data) => console.log(data.toString()));

  process.on('SIGINT', () => {
    process.exit();
  });
}
