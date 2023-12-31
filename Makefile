.PHONY: run
run: build
	docker run --rm \
		--mount "type=bind,src=$(PWD)/src,target=/app/src" \
		--mount "type=bind,src=$(PWD)/NetscriptDefinitions.d.ts,target=/app/NetscriptDefinitions.d.ts" \
		-p 12525:12525 \
		--name bitburner-filesync bitburner-typescript

.PHONY: build
build:
	docker build -t bitburner-typescript .