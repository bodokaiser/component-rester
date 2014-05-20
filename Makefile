SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)

test: build
	@mocha --reporter spec

build:
	@component install --dev
	@component build --dev

clean:
	@rm -rf build components node_modules

.PHONY: build clean
