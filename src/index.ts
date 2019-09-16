import { run } from './run';

if (process.argv.length != 3) {
  console.log('usage ./script {url}');

  process.exit(1);
} else {
  // print to stdout
  // to be picked up by another process
  run(process.argv[2]).subscribe(v => console.log(JSON.stringify(v)));
}
