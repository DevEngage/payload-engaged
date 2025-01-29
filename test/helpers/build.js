import nextBuild from 'next/dist/build/index.js'

const build = async () => {
  if ('default' in nextBuild) {
    // @ts-ignore
    await nextBuild.default(
      process.env.NEXTJS_DIR,
      false,
      false,
      false,
      true,
      true,
      false,
      'compile',
    )
  } else {
    // @ts-ignore
    await nextBuild(process.env.NEXTJS_DIR, false, false, false, true, true, false, 'compile')
  }
}

build()
