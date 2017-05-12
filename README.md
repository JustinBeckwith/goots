# Goots
Goots is Google's default TypeScript configuration. Made with ❤️ by the Google Node.js team.

# How this works
- All sources are written in TypeScript
- All sources go in `src`
- All tests go in `test`

# Tasks
Run `gulp run <task>` to try the follow pre-built tasks.

- `clean` - deletes the compiled output directory
- `compile` - runs the TypeScript compiler
- `default` - run compile
- `format` - runs the clang format tool
- `test` - run unit tests, check format, and run lint
- `test.check-format` - runs clang format tool to test formatting
- `test.check-lint` - runs the tslint tool
- `test.compile` - compiles, and then runs tests
- `test.unit` - compiles, and then runs tests
- `watch` - automatically recompile on changes

# License
See [LICENSE.md](LICENSE.md)



