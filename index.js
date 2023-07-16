import fs from 'fs-extra'
import Koa from 'koa'
import KoaRouter from 'koa-router'

import {
  isNotFalse,
  isBoolean,
} from './utils.js'

import imagemin from 'imagemin'
import imageminGif from 'imagemin-gifsicle'
import imageminPng from 'imagemin-pngquant'
import imageminOptPng from 'imagemin-optipng'
import imageminJpeg from 'imagemin-mozjpeg'
import imageminSvgo from 'imagemin-svgo'
import imageminWebp from 'imagemin-webp'
import imageminJpegTran from 'imagemin-jpegtran'


const extRE = /\.(png|jpeg|gif|jpg|bmp|svg)$/i
async function processFile(buffer, options) {
  let content

  try {
    content = await imagemin.buffer(buffer, {
      plugins: getImageminPlugins(options),
    })

    let size = content.byteLength
    const oldSize = buffer.byteLength

    if (options.skipLargerFile && size > oldSize) {
      content = buffer
      size = oldSize
    }

    return content
  } catch (error) {
    console.error('imagemin error:' + error)
  }
}
async function viteImagemin(options) {
  const buffer = fs.readFileSync('./01.jpg')
  console.log('buffer-- ', buffer)
  const content = await processFile(buffer, options)
  console.log('content-- ', content)

  if (content) {
    fs.writeFileSync('./02.jpg', content)
  }
}

function getImageminPlugins(options) {
  const {
    gifsicle = true,
    webp = false,
    mozjpeg = false,
    pngquant = false,
    optipng = true,
    svgo = true,
    jpegTran = true,
  } = options

  const plugins = []

  if (isNotFalse(gifsicle)) {
    const opt = isBoolean(gifsicle) ? undefined : gifsicle
    plugins.push(imageminGif(opt))
  }

  if (isNotFalse(mozjpeg)) {
    const opt = isBoolean(mozjpeg) ? undefined : mozjpeg
    plugins.push(imageminJpeg(opt))
  }

  if (isNotFalse(pngquant)) {
    const opt = isBoolean(pngquant) ? undefined : pngquant
    plugins.push(imageminPng(opt))
  }

  if (isNotFalse(optipng)) {
    const opt = isBoolean(optipng) ? undefined : optipng
    plugins.push(imageminOptPng(opt))
  }

  if (isNotFalse(svgo)) {
    const opt = isBoolean(svgo) ? undefined : svgo

    // if (opt !== null && isObject(opt) && Reflect.has(opt, 'plugins')) {
    //   (opt).plugins.push({
    //     name: 'preset-default',
    //   });
    // }
    plugins.push(imageminSvgo(opt))
  }

  if (isNotFalse(webp)) {
    const opt = isBoolean(webp) ? undefined : webp
    plugins.push(imageminWebp(opt))
  }

  if (isNotFalse(jpegTran)) {
    const opt = isBoolean(jpegTran) ? undefined : jpegTran
    plugins.push(imageminJpegTran(opt))
  }
  return plugins
}

const app = new Koa()
const router = KoaRouter()


router.get('/upload', async (ctx,next) => {
  await viteImagemin({
    gifsicle: {
      optimizationLevel: 7,
      interlaced: false,
    },
    optipng: {
      optimizationLevel: 7,
    },
    mozjpeg: {
      quality: 20,
    },
    pngquant: {
      quality: [0.8, 0.9],
      speed: 4,
    },
    svgo: {
      plugins: [
        {
          name: 'removeViewBox',
        },
        {
          name: 'removeEmptyAttrs',
          active: false,
        },
      ],
    },
  });
  ctx.body="upload"
})

router.get('/', (ctx,next) => {
  ctx.body="Hello koa";
})

app.use(router.routes());

app.listen(3003)
console.log('http://localhost:3003')

