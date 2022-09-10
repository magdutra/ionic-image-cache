const { Filesystem, Directory, Encoding } = require('@capacitor/filesystem');
const { Preferences } = require('@capacitor/preferences');

const CACHE_KEY = 'cached-images';

let observer;
let cacheData;
let saveRequired;

class ImageCache extends HTMLImageElement
{

	constructor()
	{

		super();
	
		if (this.hasAttribute('clear'))
		{
			clearCacheData();
		}

		if (this.hasAttribute('lazy'))
		{
			observer.observe(this);
		}
		else
		{
			setSource(this);
		}

	}

}

(function ()
{

	observer = new IntersectionObserver(intersectionCallback);

	window.customElements.define('img-cache', ImageCache, { extends: 'img' });

	requestIdleCallback();

})();

function intersectionCallback(entries, observer)
{
	entries.forEach(entry =>
	{
		if (entry.isIntersecting && !entry.target.src)
		{
			setSource(entry.target);
		}
	});
}

function requestIdleCallback()
{
	window.requestIdleCallback(saveCacheData, { timeout: 3000 });
}

function setSource(node)
{

	let url = node.getAttribute('url');
	let expire = node.getAttribute('expire');

	makeLink(url, expire).then(link => node.src = link);

}

async function clearCacheData()
{

	await Preferences.remove({ key: CACHE_KEY });

	cacheData = [];

}

async function loadCacheData()
{

	let obj = await Preferences.get({ key: CACHE_KEY });

	cacheData = (obj.value ? JSON.parse(obj.value) : []);

}

async function saveCacheData()
{

	if (saveRequired)
	{

		saveRequired = false;

		await Preferences.set({ key: CACHE_KEY, value: JSON.stringify(cacheData) });

	}

	requestIdleCallback();

}

async function makeLink(url, expiration)
{

	if (!cacheData)
	{
		await loadCacheData();
	}

	let index = findIndex(url);

	let isCached = index != -1;

	if (isCached && isExpired(cacheData[index].expiration))
	{

		await deleteFile(cacheData[index].file);

		removeFromList(index);

		isCached = false;

	}

	try
	{

		if (!isCached)
		{
			throw new Error();
		}

		return await readFile(cacheData[index].file);

	}
	catch (error)
	{
		return await downloadImage(url, expiration);
	}

}

function findIndex(url)
{
	return cacheData.findIndex(entry => entry.url == url);
}

function isExpired(expiration)
{
	return expiration && Date.now() > (new Date(expiration)).getTime();
}

async function readFile(filename)
{

	let contents = await Filesystem.readFile({ path: filename, directory: Directory.Cache, encoding: Encoding.UTF8 });

	return contents.data;

}

async function writeFile(filename, data)
{
	return await Filesystem.writeFile({ path: filename, data: data, directory: Directory.Cache, encoding: Encoding.UTF8 });
}

async function deleteFile(filename)
{
	return await Filesystem.deleteFile({ path: filename, directory: Directory.Cache });
}

function removeFromList(index)
{

	cacheData.splice(index, 1);

	saveRequired = true;

}

function addToList(url, filename, expiration)
{

	let date = (expiration ? (new Date(Date.now() + expiration * 60000)).toISOString() : null);

	cacheData[cacheData.length] = { file: filename, expiration: date, url: url };

	saveRequired = true;

}

async function downloadImage(url, expiration)
{

	let response = await fetch(url);

	let blob = await response.blob();

	let link = await blobToBase64(blob);

	let filename = uid() + require('path').extname(url);

	await writeFile(filename, link);

	addToList(url, filename, expiration);

	return link;

}

function blobToBase64(blob)
{

	return new Promise((resolve, reject) =>
	{

		const reader = new FileReader();

		reader.onloadend = () => resolve(reader.result);

		reader.readAsDataURL(blob);

	});

}

function uid()
{
	return Math.random().toString().substr(-8) + Date.now().toString().substr(-12);
}

