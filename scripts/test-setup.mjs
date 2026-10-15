// Sources import siblings without extensions (Next bundles them as-is);
// let Node's test runner resolve those to `.ts` files.
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !/\.(?:[cm]?[jt]s|json|node)$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});
