import { task, src, series } from "gulp";
import istanbul, {
  hookRequire,
  writeReports,
  enforceThresholds,
} from "gulp-istanbul";
import jshint, { reporter as _reporter } from "gulp-jshint";
import stylish from "jshint-stylish";
import mocha from "gulp-mocha";
import jsdoc from "gulp-jsdoc3";

task("lint", function () {
  return src("./lib/**/*.js").pipe(jshint({})).pipe(_reporter(stylish));
});

task("pre-test", function () {
  return (
    src(["./lib/**/*.js"])
      // Covering files
      .pipe(istanbul())
      // Force `require` to return covered files
      .pipe(hookRequire())
  );
});

task(
  "test",
  series("pre-test", function () {
    return (
      src("./test/**/*.js", { read: false })
        .pipe(mocha({ reporter: "nyan" }))
        // Creating the reports after tests ran
        .pipe(writeReports())
        // Enforce a coverage of at least 90%
        .pipe(enforceThresholds({ thresholds: { global: 90 } }))
    );
  })
);

task("doc", function (cb) {
  src(["./lib/**/*.js"], { read: false }).pipe(jsdoc(cb));
});

task("default", series("lint", "test", "doc"));
