#!/bin/bash

cargo build --release
scp target/release/api tubes-lightsale:~/tubes/api