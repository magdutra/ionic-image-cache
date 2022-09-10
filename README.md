# ionic-image-cache

Custom HTML element to lazy load and cache images based on vanilla JS and Capacitor plugins

## Installation

`npm install ionic-image-cache`

#### Requirements:

- `@ionic/core`

## Basic Usage

Replace:

`<img src="image.jpg" />`

For:

`<img is="img-cache" url="image.jpg" />`

Notice the attribute "src" must be replaced by "url".

## Optional Attributes

#### Lazy Load

Defers loading the image until the element is shown in the viewport

`<img is="img-cache" url="image.jpg" lazy />`

Default Value: true

#### Expiration Time

Deletes the old image and downloads a new one after the indicated number of minutes

`<img is="img-cache" url="image.jpg" expire="720" />`

Default Value: 720 minutes (12 hours)

