import { Texture2D, PIXEL_TYPE, TEXTURE_WRAP, TEXTURE_FILTER, PIXEL_FORMAT } from 't3d';

export function createFloat4Texture(width, height, filtering = TEXTURE_FILTER.NEAREST, mode = TEXTURE_WRAP.REPEAT) {
	const texture = new Texture2D();
	texture.image = { width, height, data: null };
	texture.minFilter = filtering;
	texture.magFilter = filtering;
	texture.wrapS = mode;
	texture.wrapT = mode;
	texture.type = PIXEL_TYPE.FLOAT;
	texture.format = PIXEL_FORMAT.RGBA;
	texture.internalformat = PIXEL_FORMAT.RGBA32F;
	texture.generateMipmaps = false;
	texture.flipY = false;
	return texture;
}

export function createFloat2Texture(width, height, filtering = TEXTURE_FILTER.NEAREST, mode = TEXTURE_WRAP.REPEAT) {
	const texture = new Texture2D();
	texture.image = { width, height, data: null };
	texture.minFilter = filtering;
	texture.magFilter = filtering;
	texture.wrapS = mode;
	texture.wrapT = mode;
	texture.type = PIXEL_TYPE.FLOAT;
	texture.format = PIXEL_FORMAT.RG;
	texture.internalformat = PIXEL_FORMAT.RG32F;
	texture.generateMipmaps = false;
	texture.flipY = false;
	texture.unpackAlignment = 1;
	return texture;
}