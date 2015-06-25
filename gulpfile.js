var gulp = require('gulp'),
    browserify = require("browserify"),
    concat = require("gulp-concat"),
    ractivate = require("ractivate"),
    through2 = require("through2");

gulp.task('default', function() {
    gulp.src("app/index.js")
        .pipe(through2.obj(function (file, enc, next){
            browserify(file.path)
                .transform(ractivate)
                .bundle(function(err, res)
                {
                    if ( err ) console.log(err);
                    file.contents = res;
                    next(null, file);
                });

        }))
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest("static"));
});