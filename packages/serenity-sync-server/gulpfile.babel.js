import gulp from 'gulp';
import ts from 'gulp-typescript';
import merge from 'merge2';
import tslint from 'gulp-tslint';
import nodemon from 'gulp-nodemon';

const tsProject = ts.createProject('tsconfig.json');

gulp.task('lint', () => {
  gulp.src(['src/**/*.ts', 'src/**/*.tsx'])
    .pipe(tslint({
      formatter: 'verbose',
    }));
});

gulp.task('copy-config', () => {
  gulp.src('config/**/*').pipe(gulp.dest('build/config'));
});

gulp.task('build', ['lint', 'copy-config'], () => {
  const tsResult = gulp.src(['src/**/*.ts', 'src/**/*.tsx', '!src/**/__tests__/*', '!src/**/__mocks__/*'])
    .pipe(tsProject());
  
  return merge([ 
    tsResult.dts.pipe(gulp.dest('build/definitions')),
    tsResult.js.pipe(gulp.dest('build/js'))
  ]);
});

gulp.task('watch', ['build'], () => {
  gulp.watch(['src/**/*.ts', 'src/**/*.tsx'], ['build']);
});

gulp.task('start', ['watch'], () => {
  nodemon({
    script: 'build/js/server.js',
  })
});
