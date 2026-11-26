# Made of What I Buy

## Run the artwork

Extract the ZIP, open a terminal in the `code` folder, and run the local server with Node.js.

```sh
node serve.mjs
```

[Open the local artwork](http://127.0.0.1:8787/index.html). The canvas fills the browser viewport. Use a 1920 × 1080 viewport for Full HD assessment and capture.

You can also double-click the extracted `index.html` for a preview with the included photos. The local server reads the current contents of `products/` whenever you reload. The bundled p5.js library lets both launch methods run offline.

## Product images

Put your images directly in `products/` and reload the artwork. The current catalogue contains nine product photos. Folder images and files chosen in Project info both get the same high-contrast black-and-white treatment and fold detection.

PNG, JPEG, WebP, GIF, AVIF, BMP, and SVG are supported in browsers that can decode them. Animated images are sampled as stills. Browser support for HEIC and TIFF varies. Project info reports the number of unreadable files skipped.

## Static hosting

Refresh the catalogues after adding, renaming, or removing images for static hosting or the double-click preview. Run this from `code`.

```sh
node serve.mjs --write-catalog
```

## Compilation

Open the design document for the concept, process and future sound design. [Design document](../design-documents/COMM2754-26t3-s4012968-A1w05-MadeOfWhatIBuy-DesignDocument.html)

## Licence and credit

Made of What I Buy was designed by Dang Tri Nhan (s4012968) for COMM2754 at RMIT University Vietnam. The project source code is distributed under GNU GPL 3.0. See [LICENSE](LICENSE) and the [third-party credits](THIRD-PARTY.md).
