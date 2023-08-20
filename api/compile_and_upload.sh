#!/bin/bash

cargo build --release
ssh tubes-lightsale "sudo systemctl stop tubes-api"
scp target/release/api tubes-lightsale:~/tubes/api
ssh tubes-lightsale "sudo systemctl start tubes-api"