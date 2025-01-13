#!/usr/bin/env bash

find . -name "*.enc.*" -exec sops updatekeys -y {} \;
