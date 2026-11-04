import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');

const options = {
  entryPoints: ['src/index.js'],
  outfile: 'dist/bundle.js',
  bundle: true,
  format: 'iife',
  target: 'es2022',
  loader: { '.css': 'text' },
  minify: !watch && !serve,
  legalComments: 'none',
  logLevel: 'info',
};

if (watch || serve) {
  const context = await esbuild.context(options);
  await context.watch();
  if (serve) {
    const { port } = await context.serve({ servedir: 'dist', port: 10003, cors: { origin: '*' } });
    console.log(`Serving http://localhost:${port}/bundle.js`);
  }
} else {
  await esbuild.build(options);
}
