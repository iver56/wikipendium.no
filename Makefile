.PHONY: all
all: update migrate

.PHONY: run
run:
	python manage.py runserver

.PHONY: serve
serve:
	python manage.py runserver 0.0.0.0:8000

.PHONY: update
update:
	pip install -r requirements.txt

.PHONY: migrate
migrate:
	python manage.py migrate

.PHONY: migrations
migrations:
	python manage.py makemigrations

.PHONY: lint
lint:
	flake8 wikipendium/ --exclude=migrations,settings,diff.py

.PHONY: test
test:
	python manage.py test

.PHONY: setup
setup:
	virtualenv venv
	cp wikipendium/settings/local.py.example wikipendium/settings/local.py

.PHONY: shell
shell:
	python manage.py shell
