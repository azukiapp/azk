# azk's simple benchmark

This script _should_ run every time we commit on `master` branch. It runs the most used _azk commands_ using `azk demo` project. At end sends all infos to `keen.io`.

```sh
$ ./src/libexec/profiling/run_benchmark_azk.sh
```

- all results are write to `BENCHMARKS_RESULTS` folder
- all data, including host info, will be send to `keen.io` at end
