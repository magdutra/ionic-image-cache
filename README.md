# ionic-image-cache

Custom HTML element for use with Ionic that lazy loads and caches images based on vanilla JS and Capacitor plugins

## Installation

`npm install ionic-image-cache`

## Basic Usage

Replace:

`<img src="image.jpg" />`

For:

`<img is="img-cache" url="image.jpg" />`

Notice the attribute "src" must be replaced by "url".

## Optional Attributes

#### Lazy Load

Defers loading the image until the element is visible in the viewport

`<img is="img-cache" url="image.jpg" lazy />`

#### Expiration Time

Deletes the old image and downloads a new one after a number of minutes

`<img is="img-cache" url="image.jpg" expire="720" />`

#### Clear cache

Empties the cache

`<img is="img-cache" url="image.jpg" clear />`

##### Note: All three attributes can be combined:

`<img is="img-cache" url="image.jpg" clear lazy expire="10" />`

