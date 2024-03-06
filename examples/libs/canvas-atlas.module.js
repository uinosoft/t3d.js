/**
 * The Sprite class represents a specific region within a CanvasAtlas.
 * Sprite instances are created by CanvasAtlas.createSprite() and destroyed by CanvasAtlas.removeSprite().
 * @private
 */
class Sprite {
  /**
   * Create a sprite.
   * @param {object} [region] - The region of the atlas that this sprite occupies.
   * @param {number} [padding=1] - The padding of this sprite.
   */
  constructor(region = { x: 0, y: 0, w: 1, h: 1, r: false }, padding = 1) {
    /**
     * The region of the atlas that this sprite occupies.
     * @type {object}
     */
    this.region = region;

    /**
     * The padding of this sprite.
     */
    this.padding = padding;

    /**
     * The uv transform of this sprite.
     * @type {object}
     */
    this.transform = {
      offset: [0, 0],
      repeat: [1, 1],
      rotated: false,
    };
  }

  /**
   * Calculate the uv transform for this sprite. This should be called whenever the region changes.
   * @param {number} width - The width of the atlas.
   * @param {number} height - The height of the atlas.
   */
  calculateTransform(width, height) {
    const { x, y, w, h, r } = this.region;

    const padding = this.padding;

    const offset = this.transform.offset;
    const repeat = this.transform.repeat;

    offset[0] = (x + padding) / width;
    offset[1] = (y + padding) / height;

    repeat[0] = (w - padding * 2) / width;
    repeat[1] = (h - padding * 2) / height;

    this.transform.rotated = r !== undefined ? r : false;
  }

  /**
   * Get the uv matrix for this sprite.
   * @param {number[]} [target] - The target array to store the matrix in.
   * @returns {number[]} The uv matrix.
   */
  getMatrix(target = new Array(9)) {
    const { offset, repeat, rotated } = this.transform;

    const rotation = rotated ? Math.PI / 2 : 0;

    const c = Math.cos(rotation);
    const s = Math.sin(rotation);

    target[0] = repeat[0] * c;
    target[1] = -repeat[1] * s;
    target[2] = 0;
    target[3] = repeat[0] * s;
    target[4] = repeat[1] * c;
    target[5] = 0;
    target[6] = offset[0];
    target[7] = offset[1];
    target[8] = 1;

    return target;
  }
}

/**
 * The CellSearchBinPacker class is an implementation of the bin packing algorithm.
 * It is used to pack regions into a larger region.
 * Ref - https://github.com/layabox/LayaAir/blob/Master3.0/src/layaAir/laya/webgl/text/AtlasGrid.ts
 * Modify - optimize: more efficient distance field
 * Modify - feature: support release region
 */
class CellSearchBinPacker {
  /**
   * Create a new CellSearchBinPacker instance.
   * @param {number} width - The width of the region to pack into.
   * @param {number} height - The height of the region to pack into.
   * @param {object} [options] - The options object.
   * @param {number} [options.cellWidth=256] - The width of the cell.
   * @param {number} [options.cellHeight=256] - The height of the cell.
   */
  constructor(width, height, options = {}) {
    this._cellWidth = options.cellWidth || 256;
    this._cellHeight = options.cellHeight || 256;

    this._scalarX = this._cellWidth / width;
    this._scalarY = this._cellHeight / height;

    // distance field to speed up the search - [filled0, width0, height0, filled1, ...]
    // for better performance, we can only maintain the distance field for available cells
    // filled: 0 - empty, 1 - filled
    // width: the max consecutive available cells to the right
    // height: the max consecutive available cells to the bottom
    this._cells = new Uint16Array(this._cellWidth * this._cellHeight * 3);

    // store the max consecutive available cells for each row
    this._rowMaxWidth = new Uint16Array(this._cellHeight);

    this._resetBuffers();
  }

  /**
   * Pack a region.
   * @param {object} region - The region object to pass the size and store the offset.
   * @return {boolean} Whether the region was packed.
   */
  pack(region) {
    // generate cell region
    region.__cell = region.__cell || {};
    region.__cell.x = 0;
    region.__cell.y = 0;
    region.__cell.w = Math.ceil(region.w * this._scalarX);
    region.__cell.h = Math.ceil(region.h * this._scalarY);

    if (!this._search(region.__cell)) {
      return false;
    }

    this._fill(region.__cell, 1);

    region.x = region.__cell.x / this._scalarX;
    region.y = region.__cell.y / this._scalarY;

    return true;
  }

  /**
   * Release a region.
   * @param {object} region - The region object to release.
   */
  release(region) {
    this._fill(region.__cell, 0);
  }

  /**
   * Clear all regions.
   */
  clear() {
    this._resetBuffers();
  }

  /**
   * Search for a region to pack.
   * @private
   * @param {object} region - The region object to pass the size and store the offset.
   * @returns {boolean} Whether the region was found.
   */
  _search(region) {
    const { w, h } = region;

    if (w > this._cellWidth || h > this._cellHeight) {
      return false;
    }

    // the returned value
    let rx = -1,
      ry = -1;

    const nWidth = this._cellWidth,
      nHeight = this._cellHeight,
      cells = this._cells,
      rowMaxWidth = this._rowMaxWidth;

    // search every row
    for (let y = 0; y < nHeight; y++) {
      // if this row's max consecutive available cells is fewer than needed, skip it
      if (rowMaxWidth[y] < w) continue;

      // search cells in this row
      let passedCells = -1;
      for (let x = 0; x < nWidth; ) {
        const tm = (y * nWidth + x) * 3;

        // if cells are occupied, skip it
        if (cells[tm] != 0) {
          x += cells[tm + 1];
          passedCells = -1;
          continue;
        }

        // if the consecutive available cells are enough, begin to count
        if (passedCells == -1) {
          if (cells[tm + 1] >= w) {
            rx = x;
            ry = y;
            passedCells = 0;
          } else {
            x += cells[tm + 1];
            continue;
          }
        }

        if (cells[tm + 2] >= h) {
          // if the vertical distance is enough, count
          passedCells++;
        } else {
          // otherwise, break the consecutive count
          passedCells = -1;
        }

        x++;

        if (passedCells === w) {
          region.x = rx;
          region.y = ry;
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Fill region.
   * @private
   * @param {object} region - The region to fill.
   * @param {number} [type=1] - The fill type. 0 - clear, 1 - fill.
   */
  _fill(region, type = 1) {
    const { x, y, w, h } = region;

    const nWidth = this._cellWidth;
      this._cellHeight;
      const cells = this._cells,
      rowMaxWidth = this._rowMaxWidth;

    const oppositeType = 1 - type;

    // update cells in the horizontal direction
    for (let yy = y; yy < h + y; yy++) {
      rowMaxWidth[yy] -= (type * 2 - 1) * w; // update row max width

      const tmNext = (yy * nWidth + x + w) * 3;
      const isNextConsecutive = cells[tmNext] !== undefined && cells[tmNext] == type;

      const tmPrev = (yy * nWidth + x - 1) * 3;
      const isPrevConsecutive = cells[tmPrev] !== undefined && cells[tmPrev] == type;
      const prevType = isPrevConsecutive ? type : oppositeType;

      let distanceX = isNextConsecutive ? cells[tmNext + 1] : 0;

      for (let xx = w + x - 1; xx >= 0; xx--) {
        const tm = (yy * nWidth + xx) * 3;
        if (xx >= x) {
          cells[tm] = type; // update filled state
          cells[tm + 1] = ++distanceX;
        } else if (cells[tm] == prevType && prevType == 0) {
          // optimize: update only when type is 0
          cells[tm + 1] = isPrevConsecutive ? ++distanceX : x - xx;
        } else {
          break;
        }
      }
    }

    // update cells in the vertical direction
    for (let xx = x; xx < w + x; xx++) {
      const tmNext = ((y + h) * nWidth + xx) * 3;
      const isNextConsecutive = cells[tmNext] !== undefined && cells[tmNext] == type;

      const tmPrev = ((y - 1) * nWidth + xx) * 3;
      const isPrevConsecutive = cells[tmPrev] !== undefined && cells[tmPrev] == type;
      const prevType = isPrevConsecutive ? type : oppositeType;

      let distanceY = isNextConsecutive ? cells[tmNext + 2] : 0;

      for (let yy = h + y - 1; yy >= 0; yy--) {
        const tm = (yy * nWidth + xx) * 3;
        if (yy >= y) {
          cells[tm + 2] = ++distanceY;
        } else if (cells[tm] == prevType && prevType == 0) {
          // optimize: update only when type is 0
          cells[tm + 2] = isPrevConsecutive ? ++distanceY : y - yy;
        } else {
          break;
        }
      }
    }
  }

  /**
   * Reset all cells cache.
   * @private
   */
  _resetBuffers() {
    const nWidth = this._cellWidth,
      nHeight = this._cellHeight,
      cells = this._cells,
      rowMaxWidth = this._rowMaxWidth;

    for (let y = 0; y < nHeight; y++) {
      for (let x = 0; x < nWidth; x++) {
        const tm = (y * nWidth + x) * 3;
        cells[tm] = 0;
        cells[tm + 1] = nWidth - x;
        cells[tm + 2] = nHeight - y;
      }
    }

    for (let y = 0; y < nHeight; y++) {
      rowMaxWidth[y] = nWidth;
    }
  }
}

/**
 * The BinaryTreeBinPacker class is an implementation of the binary tree bin packing algorithm.
 * It is used to pack regions into a larger region.
 * Ref: https://github.com/flexelektro/texture-packer/tree/master/src
 * TODO - optimize: rotate sprite if it fits better
 */
class BinaryTreeBinPacker {
  /**
   * Create a new BinaryTreeBinPacker instance.
   * @param {number} width - The width of the region to pack into.
   * @param {number} height - The height of the region to pack into.
   * @param {object} [options] - The options object.
   */
  constructor(width, height, options = {}) {
    this._root = new BinaryTree(0, 0, width, height);
    this._released = [];
  }

  /**
   * Pack a region.
   * @param {object} region - The region object to pass the size and store the offset.
   * @return {boolean} Whether the region was packed.
   */
  pack(region) {
    const { w, h } = region;

    let targetNode = null;
    let rotated = false;

    for (let i = 0, l = this._released.length; i < l; i++) {
      const node = this._released[i];
      if (node.selfW >= w && node.selfH >= h) {
        this._released.splice(i, 1);
        targetNode = node;
        break;
      } else if (node.selfW >= h && node.selfH >= w) {
        this._released.splice(i, 1);
        targetNode = node;
        rotated = true;
        break;
      }
    }

    if (!targetNode) {
      targetNode = this._root.insert(w, h);
    }

    if (targetNode) {
      region.__node = targetNode;
      region.x = targetNode.x;
      region.y = targetNode.y;
      region.r = rotated;
      if (rotated) {
        region.w = h;
        region.h = w;
      }
      return true;
    }

    return false;
  }

  /**
   * Release a region.
   * @param {object} region - The region object to release.
   */
  release(region) {
    this._released.push(region.__node);
  }

  /**
   * Clear all regions.
   */
  clear() {
    const { w, h } = this._root;
    this._root = new BinaryTree(0, 0, w, h);
    this._released = [];
  }
}

class BinaryTree {
  constructor(x = 0, y = 0, w = 1, h = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.selfW = 0;
    this.selfH = 0;

    this.filled = false;
    this.splited = false;

    this.right = null;
    this.down = null;
  }

  insert(w, h) {
    if (w > this.w || h > this.h) {
      return null;
    }

    if (this.filled) {
      const verticalSplite = this.x > 0;

      !this.splited && this.split(verticalSplite);

      if (verticalSplite) {
        return this.down.insert(w, h) || this.right.insert(w, h);
      } else {
        return this.right.insert(w, h) || this.down.insert(w, h);
      }
    }

    this.selfW = w;
    this.selfH = h;

    this.filled = true;

    return this;
  }

  split(vertical) {
    this.right = new BinaryTree(this.x + this.selfW, this.y, this.w - this.selfW, vertical ? this.h : this.selfH);
    this.down = new BinaryTree(this.x, this.y + this.selfH, vertical ? this.selfW : this.w, this.h - this.selfH);
    this.splited = true;
  }
}

/**
 * The internal atlas canvas.
 * This is used to draw/erase sub-regions.
 * @private
 */
class InternalAtlasCanvas {
  constructor(width = 1024, height = 1024) {
    this._element = document.createElement("canvas");
    this._element.width = width;
    this._element.height = height;

    this._ctx = this._element.getContext("2d");
  }

  /**
   * Get the canvas element.
   * @return {HTMLCanvasElement} The canvas element.
   */
  get element() {
    return this._element;
  }

  /**
   * Get the canvas width.
   * @return {number} The canvas width.
   */
  get width() {
    return this._element.width;
  }

  /**
   * Get the canvas height.
   * @return {number} The canvas height.
   */
  get height() {
    return this._element.height;
  }

  /**
   * Get the canvas area in pixels.
   * @return {number} The canvas area in pixels.
   */
  get area() {
    return this._element.width * this._element.height;
  }

  /**
   * Draw an image.
   * @param {HTMLImageElement|HTMLCanvasElement} image - The image to draw.
   * @param {object} region - The target region to draw.
   * @param {object} sourceRegion - The source region to draw.
   */
  drawImage(image, region, sourceRegion, padding) {
    if (region.r) {
      this._ctx.translate(region.x, region.y);
      this._ctx.rotate(Math.PI / 2);

      this._ctx.drawImage(
        image,
        sourceRegion.x,
        sourceRegion.y,
        sourceRegion.w,
        sourceRegion.h,
        0 + padding,
        -region.w + padding,
        region.h - padding * 2,
        region.w - padding * 2,
      );

      this._ctx.rotate(-Math.PI / 2);
      this._ctx.translate(-region.x, -region.y);
    } else {
      this._ctx.drawImage(
        image,
        sourceRegion.x,
        sourceRegion.y,
        sourceRegion.w,
        sourceRegion.h,
        region.x + padding,
        region.y + padding,
        region.w - padding * 2,
        region.h - padding * 2,
      );
    }
  }

  /**
   * Clear a region.
   * @param {object} region - The region to clear.
   */
  clearRegion(region) {
    this._ctx.clearRect(region.x, region.y, region.w, region.h);
  }

  /**
   * Clear the canvas.
   */
  clear() {
    this._ctx.clearRect(0, 0, this._element.width, this._element.height);
  }
}

/**
 * The canvas atlas class.
 */
class CanvasAtlas {
  /**
   * Create a canvas atlas instance.
   * @param {object} [options] - The options object.
   * @param {number} [options.width=2048] - The width of the atlas.
   * @param {number} [options.height=2048] - The height of the atlas.
   * @param {string} [options.packer="CellSearch"] - The packer to use. "CellSearch" or "BinaryTree".
   * @param {number} [options.cellWidth=256] - The width of the cells. Only used when packer is "CellSearch".
   * @param {number} [options.cellHeight=256] - The height of the cells. Only used when packer is "CellSearch".
   */
  constructor(options = {}) {
    this._sprites = new Set();

    this._fillRate = 0;

    this._canvas = new InternalAtlasCanvas(options.width || 2048, options.height || 2048);

    this._packer = null;
    this.setPacker(options.packer, {
      cellWidth: options.cellWidth,
      cellHeight: options.cellHeight,
    });
  }

  /**
   * Set the packer.
   * @param {string} name - The name of the packer. "CellSearch" or "BinaryTree".
   * @param {object} [options] - The options object.
   * @param {number} [options.cellWidth=256] - The width of the cells. Only used when packer is "CellSearch".
   * @param {number} [options.cellHeight=256] - The height of the cells. Only used when packer is "CellSearch".
   * @return {boolean} Whether the packer was set.
   */
  setPacker(name = "CellSearch", options) {
    if (this._sprites.size > 0) {
      console.warn("Cannot change packer when there are sprites in the atlas. Please clear the atlas first.");
      return false;
    }

    this._packer = new {
      CellSearch: CellSearchBinPacker,
      BinaryTree: BinaryTreeBinPacker,
    }[name](this._canvas.width, this._canvas.height, options);

    return true;
  }

  /**
   * Create a sprite.
   * @param {HTMLImageElement|HTMLCanvasElement} data - The data to create the sprite from.
   * @param {object} sourceRegion - The region of the data to create the sprite from. { x, y, w, h }.
   * @return {Sprite|null} The created sprite. Null if the sprite could not be created.
   */
  createSprite(data, sourceRegion, padding = 1) {
    const region = {
      x: 0,
      y: 0,
      w: sourceRegion.w + padding * 2,
      h: sourceRegion.h + padding * 2,
      r: false,
    };

    if (this._packer.pack(region)) {
      const sprite = new Sprite(region, padding);
      sprite.calculateTransform(this._canvas.width, this._canvas.height);

      this._canvas.drawImage(data, region, sourceRegion, padding);
      this._sprites.add(sprite);
      this._fillRate += (region.w * region.h) / this._canvas.area;

      return sprite;
    }

    return null;
  }

  /**
   * Remove a sprite.
   * @param {Sprite} sprite - The sprite to remove.
   */
  removeSprite(sprite) {
    if (!this._sprites.has(sprite)) {
      return;
    }

    this._canvas.clearRegion(sprite.region);
    this._packer.release(sprite.region);
    this._sprites.delete(sprite);
    this._fillRate -= (sprite.region.w * sprite.region.h) / this._canvas.area;
  }

  /**
   * Clear the atlas.
   * All sprites will be removed.
   */
  clear() {
    this._sprites.clear();
    this._fillRate = 0;
    this._canvas.clear();
    this._packer.clear();
  }

  /**
   * Get the number of sprites in the atlas.
   * @return {number} The number of sprites in the atlas.
   */
  get spriteCount() {
    return this._sprites.size;
  }

  /**
   * Get the fill rate of the atlas.
   * @return {number} The fill rate of the atlas.
   */
  get fillRate() {
    return this._fillRate;
  }

  /**
   * Get the canvas.
   * @return {HTMLCanvasElement} The canvas.
   */
  get canvas() {
    return this._canvas.element;
  }
}

export { CanvasAtlas };
