tests:
	npm run test

deploy:
	node deploy.js

lint:
	npx eslint --ext .js .
