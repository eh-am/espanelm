import { run } from './providers';

if (process.argv.length != 3) {
  console.log('usage ./script {provider}');

  process.exit(1);
} else {
  // print to stdout
  // to be picked up by another process
  const arg = process.argv[2];

  if (arg === 'elpais') {
    run(arg).subscribe(v => console.log(JSON.stringify(v)));
  } else {
    console.log('Provider not supported', arg);
    process.exit(1);
  }
}
