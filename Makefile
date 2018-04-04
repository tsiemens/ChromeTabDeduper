SRC = $(wildcard src/*)
ZIPFILE = TabDeduper.zip

$(ZIPFILE): $(SRC)
	zip -r $(ZIPFILE) src

zip:
