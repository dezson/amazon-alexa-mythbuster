.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: test
test: ## Execute all the unit tests with coverage report
	cd alexa-skill && bst test

.PHONY: deploy
deploy: ## Deploy the amazon alexa skill
	cd alexa-skill && ask deploy

.PHONY: clean
clean: ## Remove the test output files
	cd alexa-skill && rm -rf test_output
