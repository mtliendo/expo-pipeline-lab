const { withTamagui } = require('@tamagui/cli/metro')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm')
}

// Reads compiler options from tamagui.build.ts.
module.exports = withTamagui(config)
