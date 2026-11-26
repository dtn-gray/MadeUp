'use strict';

const productImages = (() => {
  const resolution = 192;

  const unit = (value) => Math.max(0, Math.min(1, value));
  const brightness = (pixels, offset) => (pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722) / 255;

  function foregroundMask(pixels, alpha, width, height) {
    // Remove a flat backdrop only when most of the perimeter agrees on its color.
    const right = width - 2;
    const bottom = height - 2;
    const midX = Math.round(right / 2);
    const midY = Math.round(bottom / 2);
    const perimeter = [[1, 1], [right, 1], [right, bottom], [1, bottom],
      [midX, 1], [right, midY], [midX, bottom], [1, midY]].map(([x, y]) => y * width + x);
    const similar = (a, b) => Math.max(
      Math.abs(pixels[a * 4] - pixels[b * 4]),
      Math.abs(pixels[a * 4 + 1] - pixels[b * 4 + 1]),
      Math.abs(pixels[a * 4 + 2] - pixels[b * 4 + 2])
    ) <= 34;
    const background = perimeter.find((anchor) => alpha[anchor] > 237 &&
      perimeter.filter((index) => alpha[index] > 237 && similar(index, anchor)).length >= 6);
    if (background === undefined) return alpha;

    const cutout = alpha.slice();
    const visited = new Uint8Array(alpha.length);
    const queue = new Int32Array(alpha.length);
    let end = 0;
    function visit(index) {
      if (visited[index] || (alpha[index] >= 16 && !similar(index, background))) return;
      visited[index] = 1;
      cutout[index] = 0;
      queue[end++] = index;
    }
    visit(0);
    for (let i = 0; i < end; i++) {
      const index = queue[i];
      const x = index % width;
      if (x) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (index >= width) visit(index - width);
      if (index < queue.length - width) visit(index + width);
    }

    // A flat or tightly framed image still gets its own frame and line work.
    const remaining = cutout.reduce((sum, value) => sum + Number(value > 24), 0);
    return remaining >= Math.max(6, (width - 2) * (height - 2) * 0.024) ? cutout : alpha;
  }

  function imageBounds(alpha, width, height) {
    let left = width, top = height, right = -1, bottom = -1;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (alpha[y * width + x] < 6) continue;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left) return null;
    return { x: left - 1, y: top - 1, width: right - left + 3, height: bottom - top + 3 };
  }

  function percentile(histogram, count, fraction) {
    let sum = 0;
    for (let index = 0; index < histogram.length; index++) {
      sum += histogram[index];
      if (sum >= count * fraction) return index / 255;
    }
    return 1;
  }

  function tones(pixels, alpha) {
    const luminance = new Float32Array(alpha.length);
    const histogram = new Uint32Array(256);
    let count = 0;
    for (let i = 0; i < alpha.length; i++) {
      const light = brightness(pixels, i * 4);
      luminance[i] = light;
      if (!alpha[i]) continue;
      histogram[Math.round(light * 255)]++;
      count++;
    }
    const low = percentile(histogram, count, 0.055);
    const high = percentile(histogram, count, 0.945);
    const spread = high - low;
    const contrast = unit(spread * 8) * 0.74;
    const dark = new Float32Array(alpha.length);
    for (let i = 0; i < dark.length; i++) {
      const light = luminance[i];
      const adjusted = light * (1 - contrast) + unit((light - low) / Math.max(0.06, spread)) * contrast;
      dark[i] = 1 - adjusted;
    }
    return dark;
  }

  function traceCrease(alpha, dark, width, bounds, vertical, lane) {
    const longStart = vertical ? bounds.y : bounds.x;
    const longSize = vertical ? bounds.height : bounds.width;
    const crossStart = vertical ? bounds.x : bounds.y;
    const crossSize = vertical ? bounds.width : bounds.height;
    const first = longStart + Math.floor(longSize * 0.10);
    const length = Math.max(1, Math.round(longSize * 0.80));
    const left = Math.floor(crossSize * (lane ? 0.32 : 0));
    const right = Math.max(left + 1, Math.ceil(crossSize * (lane ? 1 : 0.68)));
    const columns = right - left;
    const radius = Math.max(2, Math.min(6, Math.round(crossSize * 0.041)));
    const parents = new Uint16Array(length * columns);
    const weights = new Float32Array(length * columns);
    let previous = new Float32Array(columns);
    let current = new Float32Array(columns);
    const pixel = (along, across) => vertical ? along * width + across : across * width + along;

    // Pay for jumps between adjacent pixels so a crease stays continuous through the cloth.
    for (let row = 0; row < length; row++) {
      for (let column = 0; column < columns; column++) {
        const across = left + column;
        const offset = pixel(first + row, crossStart + across);
        const before = pixel(first + row, crossStart + Math.max(0, across - radius));
        const after = pixel(first + row, crossStart + Math.min(crossSize - 1, across + radius));
        const center = dark[offset] * alpha[offset] / 255;
        const flankA = dark[before] * alpha[before] / 255;
        const flankB = dark[after] * alpha[after] / 255;
        const crease = Math.max(0, center - Math.max(flankA, flankB));
        const edge = Math.max(0, center - Math.min(flankA, flankB));
        const interior = Math.min(alpha[before], alpha[after]) / 255;
        const presence = alpha[offset] / 255;
        const weight = (crease * 1.85 + edge * 0.37) * (0.22 + 0.78 * interior)
          + center * 0.055 + interior * 0.06 + presence * 0.15 - (1 - presence) * 0.64;

        let best = previous[column];
        let parent = column;
        for (let step = -2; step <= 2; step++) {
          const candidate = column + step;
          if (candidate < 0 || candidate >= columns) continue;
          const score = previous[candidate] - Math.abs(step) * 0.045;
          if (score <= best) continue;
          best = score;
          parent = candidate;
        }
        current[column] = best + weight;
        parents[row * columns + column] = parent;
        weights[row * columns + column] = weight;
      }
      [previous, current] = [current, previous];
    }

    let column = previous.reduce((best, value, index) => value > previous[best] ? index : best, 0);
    const points = new Array(length);
    const quality = new Float32Array(length);
    for (let row = length - 1; row >= 0; row--) {
      const along = first + row;
      const across = crossStart + left + column;
      points[row] = vertical ? [across, along] : [along, across];
      quality[row] = weights[row * columns + column];
      column = parents[row * columns + column];
    }
    const windowLength = Math.min(length, Math.max(8, Math.round(longSize * 0.43)));
    let windowScore = quality.slice(0, windowLength).reduce((sum, value) => sum + value, 0);
    let score = windowScore;
    let bestStart = 0;
    for (let start = 1; start + windowLength <= length; start++) {
      windowScore += quality[start + windowLength - 1] - quality[start - 1];
      if (windowScore > score) {
        bestStart = start;
        score = windowScore;
      }
    }
    return { points: points.slice(bestStart, bestStart + windowLength), score: score / windowLength };
  }

  function describeCrease({ points, score }, bounds) {
    const [x, y] = points[Math.floor(points.length / 2)];
    const [startX, startY] = points[Math.floor((points.length - 1) * 0.18)];
    const [endX, endY] = points[Math.ceil((points.length - 1) * 0.82)];
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    const bow = dx * (y - (startY + endY) / 2) - dy * (x - (startX + endX) / 2);
    const localX = Math.max(0.5, Math.min(bounds.width - 0.5, x - bounds.x + 0.5));
    const localY = Math.max(0.5, Math.min(bounds.height - 0.5, y - bounds.y + 0.5));
    const margin = Math.min(localX, bounds.width - localX, localY, bounds.height - localY);
    return {
      x: localX,
      y: localY,
      angle: Math.atan2(dy, dx),
      length: Math.max(8, length / 0.64),
      bend: Math.abs(bow) / Math.max(1, length * length),
      score: score + 0.12 * unit(margin / (Math.min(bounds.width, bounds.height) * 0.22))
    };
  }

  function makePrint(rect, dark, alpha, stride) {
    const image = document.createElement('canvas');
    image.width = rect.width;
    image.height = rect.height;
    const context = image.getContext('2d');
    const pixels = context.createImageData(rect.width, rect.height);
    const histogram = new Uint32Array(256);
    let count = 0;

    for (let y = 0; y < rect.height; y++) {
      for (let x = 0; x < rect.width; x++) {
        const offset = (rect.y + y) * stride + rect.x + x;
        if (alpha[offset] < 6) continue;
        histogram[Math.round((1 - dark[offset]) * 255)]++;
        count++;
      }
    }
    if (!count) return null;

    const low = percentile(histogram, count, 0.08);
    const high = percentile(histogram, count, 0.94);
    const spread = high - low;
    const shadeAt = (x, y, fallback) => {
      const index = (rect.y + y) * stride + rect.x + x;
      return alpha[index] > 6 ? dark[index] : fallback;
    };
    for (let y = 0; y < rect.height; y++) {
      for (let x = 0; x < rect.width; x++) {
        const offset = (rect.y + y) * stride + rect.x + x;
        const opacity = alpha[offset];
        if (!opacity) continue;
        const shadow = dark[offset];
        const light = 1 - shadow;
        const contrast = spread > 0.048 ? unit((light - low) / spread) : light * 0.62 + 0.19;
        // Deepen narrow shadows where neighboring photo pixels are lighter.
        const across = Math.max(shadeAt(Math.max(0, x - 3), y, shadow), shadeAt(Math.min(rect.width - 1, x + 3), y, shadow));
        const along = Math.max(shadeAt(x, Math.max(0, y - 3), shadow), shadeAt(x, Math.min(rect.height - 1, y + 3), shadow));
        const fold = Math.max(0, shadow - Math.min(across, along));
        const grain = ((Math.imul(offset + 1, 0x45d9f3b) >>> 15) & 255) / 255 - 0.5;
        const dot = (x + 2 * y) % 5 === 0 ? 0.11 * (1 - Math.abs(contrast - 0.5) * 2) : 0;
        const exposure = unit(0.07 + contrast ** 0.84 * 0.88 - fold * 0.57 + grain * 0.067 - dot);
        const target = (y * rect.width + x) * 4;
        const shade = 6 + 247 * exposure;
        pixels.data[target] = shade;
        pixels.data[target + 1] = shade;
        pixels.data[target + 2] = shade;
        pixels.data[target + 3] = opacity;
      }
    }
    context.putImageData(pixels, 0, 0);
    return image;
  }

  function analyze(source, crop, name) {
    if (crop.width < 1 || crop.height < 1) return null;
    const scale = resolution / Math.max(crop.width, crop.height);
    const width = Math.max(1, Math.round(crop.width * scale)) + 2;
    const height = Math.max(1, Math.round(crop.height * scale)) + 2;
    const image = document.createElement('canvas');
    image.width = width;
    image.height = height;
    const context = image.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 1, 1, width - 2, height - 2);
    const pixels = context.getImageData(0, 0, width, height);
    const alpha = new Uint8Array(width * height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels.data[i * 4 + 3];
    const foreground = foregroundMask(pixels.data, alpha, width, height);
    const bounds = imageBounds(foreground, width, height);
    if (!bounds) return null;
    const dark = tones(pixels.data, foreground);
    const photoBounds = { x: 1, y: 1, width: width - 2, height: height - 2 };
    const print = makePrint(photoBounds, dark, alpha, width);
    if (!print) return null;
    const creases = [false, true].flatMap((vertical) =>
      [0, 1].map((lane) => traceCrease(foreground, dark, width, bounds, vertical, lane))
    ).map((crease) => describeCrease(crease, photoBounds)).sort((a, b) => b.score - a.score);

    const weakest = creases[0].score - Math.max(0.08, creases[0].score * 0.22);
    return { name, image: print, creases: creases.filter(({ score }) => score >= weakest) };
  }

  async function decode(url) {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }

  async function readFile(file, name = file.name) {
    const bitmap = typeof createImageBitmap === 'function'
      ? await createImageBitmap(file).catch(() => null)
      : null;
    if (bitmap) {
      try {
        return analyze(bitmap, { x: 0, y: 0, width: bitmap.width, height: bitmap.height }, name);
      } finally {
        bitmap.close();
      }
    }
    const url = URL.createObjectURL(file);
    try {
      const image = await decode(url);
      return analyze(image, { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }, name);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function collect(sources, read, current = () => true) {
    const products = [];
    for (const source of sources) {
      if (!current()) break;
      try {
        const product = await read(source);
        if (product) products.push(product);
      } catch {
        // One unreadable file does not interrupt the rest of the catalog.
      }
    }
    return { products, skipped: sources.length - products.length };
  }

  async function loadCatalog({ images, samples }, readPicture) {
    const own = await collect(images, readPicture);
    if (own.products.length) return own;
    const defaults = await collect(samples, readPicture);
    return { products: defaults.products, skipped: own.skipped + defaults.skipped };
  }

  async function readFolderPicture(directory, path) {
    const parts = path.split('/');
    const file = parts.at(-1);
    const withinFolder = parts.length === 1 || (parts.length === 2 && parts[0] === 'samples');
    if (!withinFolder || !file || file === '.' || file === '..' || file.includes('\\')) return null;
    const url = new URL(parts.map(encodeURIComponent).join('/'), directory);
    const picture = await fetch(url, { cache: 'no-cache' });
    if (!picture.ok) return null;
    return readFile(await picture.blob(), file.replace(/\.[^.]+$/, ''));
  }

  function readPreviewPicture({ path, type, base64 }) {
    const file = path.split('/').at(-1);
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    return readFile(new File([bytes], file, { type }), file.replace(/\.[^.]+$/, ''));
  }

  async function loadFilePreview(directory) {
    // Local pages cannot fetch other files. A classic script can supply the packaged photos.
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('preview-catalog.js', directory).href;
      script.onload = resolve;
      script.onerror = () => reject(new Error('The packaged product preview is unavailable.'));
      document.head.append(script);
    });
    return loadCatalog(globalThis.packagedProductCatalog, readPreviewPicture);
  }

  async function loadFolder() {
    const directory = new URL('products/', document.baseURI);
    if (directory.protocol === 'file:') return loadFilePreview(directory);
    const response = await fetch(new URL('catalog.json', directory), { cache: 'no-store' });
    if (!response.ok) throw new Error('Product folder listing is unavailable.');
    return loadCatalog(await response.json(), (path) => readFolderPicture(directory, path));
  }

  return { loadFolder, readFiles: (files, current) => collect(files, readFile, current) };
})();
