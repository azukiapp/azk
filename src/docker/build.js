import { _, t, Q, fs, async, defer, config, lazy_require, log } from 'azk';
import { DockerBuildNotFound, DockerBuildError } from 'azk/utils/errors';


var archiver = require('archiver');

lazy_require(this, {
  parseRepositoryTag: ['dockerode/lib/util'],
  docker: ['azk/docker', 'default'],
  uuid: 'node-uuid',
});

export function build(docker, image) {
  console.log('\n>>---------\n image:', image, '\n>>---------\n');
}
