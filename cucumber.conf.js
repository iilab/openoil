module.exports = function (config) {
    config.set({
        frameworks: [
            'cucumberjs'
        ],

        files: [
            {pattern: 'node_modules/karma-cucumberjs/vendor/cucumber-html.css', watched: false, included: false, served: true},
            {pattern: 'test/functional/app.template', watched: false, included: false, served: true},

            {pattern: 'test/functional/features/**/*.feature', watched: true, included: false, served: true},

//            'test/functional/common.js',
//            'test/functional/cucumber-world.js',
            {pattern: 'test/functional/features/step_definitions/**/*.js', watched: true, included: true, served: true}
        ],

        browsers: ['PhantomJS'],

        singleRun: true
    });
};
