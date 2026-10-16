const { withBaseMod } = require('expo/config-plugins');

/**
 * react-native-auth0@5.11.2 injects `override application(_:open:options:)` by
 * anchoring on `sourceURL(for:)`. In Expo SDK 58 that method lives on
 * `ReactNativeDelegate`, not `AppDelegate`, so Xcode fails with
 * "method does not override any method from its superclass".
 *
 * SDK 58 uses a scene-based life cycle; `ExpoAppSceneDelegate` already
 * forwards open-URL events to RCTLinkingManager. Strip the misplaced block
 * after the Auth0 plugin has written it (`nextMod` first).
 */
function stripMisplacedAuth0Linking(contents) {
  return contents.replace(
    /\n?\/\/ @generated begin react-native-auth0-linking-swift[\s\S]*?\/\/ @generated end react-native-auth0-linking-swift\n?/,
    '\n',
  );
}

module.exports = function withAuth0Expo58AppDelegate(config) {
  return withBaseMod(config, {
    platform: 'ios',
    mod: 'appDelegate',
    skipEmptyMod: true,
    async action({ modRequest: { nextMod, ...modRequest }, ...cfg }) {
      const results = await nextMod({
        ...cfg,
        modRequest,
      });
      if (results.modResults?.language === 'swift') {
        results.modResults.contents = stripMisplacedAuth0Linking(
          results.modResults.contents,
        );
      }
      return results;
    },
  });
};
