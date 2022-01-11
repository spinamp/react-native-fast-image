'use strict';

var _extends = require('@babel/runtime/helpers/extends');
var React = require('react');
var reactNative = require('react-native');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const nativeManager = reactNative.NativeModules.FastImagePreloaderManager;
const nativeEmitter = new reactNative.NativeEventEmitter(nativeManager);

class PreloaderManager {
  constructor() {
    this._instances = new Map();
    this._subProgress = void 0;
    this._subComplete = void 0;
  }

  preload(sources, onProgress, onComplete) {
    nativeManager.createPreloader().then(id => {
      if (this._instances.size === 0) {
        this._subProgress = nativeEmitter.addListener('fffastimage-progress', this.onProgress.bind(this));
        this._subComplete = nativeEmitter.addListener('fffastimage-complete', this.onComplete.bind(this));
      }

      this._instances.set(id, {
        onProgress,
        onComplete
      });

      nativeManager.preload(id, sources);
    });
  }

  onProgress({
    id,
    finished,
    total
  }) {
    const instance = this._instances.get(id);

    if (instance && instance.onProgress) instance.onProgress(finished, total);
  }

  onComplete({
    id,
    finished,
    skipped
  }) {
    const instance = this._instances.get(id);

    if (instance && instance.onComplete) instance.onComplete(finished, skipped);

    this._instances.delete(id);

    if (this._instances.size === 0 && this._subProgress && this._subComplete) {
      this._subProgress.remove();

      this._subComplete.remove();
    }
  }

}

const preloaderManager = new PreloaderManager();

const resizeMode = {
  contain: "contain",
  cover: "cover",
  stretch: "stretch",
  center: "center"
};
const priority = {
  low: "low",
  normal: "normal",
  high: "high"
};
const cacheControl = {
  // Ignore headers, use uri as cache key, fetch only if not in cache.
  immutable: "immutable",
  // Respect http headers, no aggressive caching.
  web: "web",
  // Only load from cache.
  cacheOnly: "cacheOnly"
};

function FastImageBase({
  source,
  tintColor,
  onLoadStart,
  onProgress,
  onLoad,
  onError,
  onLoadEnd,
  style,
  fallback,
  children,
  // eslint-disable-next-line no-shadow
  resizeMode = "cover",
  forwardedRef,
  ...props
}) {
  if (fallback) {
    const cleanedSource = { ...source
    };
    delete cleanedSource.cache;
    const resolvedSource = reactNative.Image.resolveAssetSource(cleanedSource);
    return /*#__PURE__*/React__default['default'].createElement(reactNative.View, {
      style: [styles.imageContainer, style],
      ref: forwardedRef
    }, /*#__PURE__*/React__default['default'].createElement(reactNative.Image, _extends__default['default']({}, props, {
      style: reactNative.StyleSheet.absoluteFill,
      source: resolvedSource,
      onLoadStart: onLoadStart,
      onProgress: onProgress,
      onLoad: onLoad,
      onError: onError,
      onLoadEnd: onLoadEnd,
      resizeMode: resizeMode
    })), children);
  }

  const resolvedSource = reactNative.Image.resolveAssetSource(source);
  return /*#__PURE__*/React__default['default'].createElement(reactNative.View, {
    style: [styles.imageContainer, style],
    ref: forwardedRef
  }, /*#__PURE__*/React__default['default'].createElement(FastImageView, _extends__default['default']({}, props, {
    tintColor: tintColor,
    style: reactNative.StyleSheet.absoluteFill,
    source: resolvedSource,
    onFastImageLoadStart: onLoadStart,
    onFastImageProgress: onProgress,
    onFastImageLoad: onLoad,
    onFastImageError: onError,
    onFastImageLoadEnd: onLoadEnd,
    resizeMode: resizeMode
  })), children);
}

const FastImageMemo = /*#__PURE__*/React.memo(FastImageBase);
const FastImageComponent = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React__default['default'].createElement(FastImageMemo, _extends__default['default']({
  forwardedRef: ref
}, props)));
FastImageComponent.displayName = "FastImage";
const FastImage = FastImageComponent;
FastImage.resizeMode = resizeMode;
FastImage.cacheControl = cacheControl;
FastImage.priority = priority;

FastImage.preload = (sources, onProgress, onComplete) => preloaderManager.preload(sources, onProgress, onComplete);

const styles = reactNative.StyleSheet.create({
  imageContainer: {
    overflow: "hidden"
  }
}); // Types of requireNativeComponent are not correct.

const FastImageView = reactNative.requireNativeComponent("FastImageView", FastImage, {
  nativeOnly: {
    onFastImageLoadStart: true,
    onFastImageProgress: true,
    onFastImageLoad: true,
    onFastImageError: true,
    onFastImageLoadEnd: true
  }
});

module.exports = FastImage;
