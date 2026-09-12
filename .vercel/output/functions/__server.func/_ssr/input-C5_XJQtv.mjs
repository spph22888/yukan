import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cn } from "./membership-server-D3uGxw8t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-C5_XJQtv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	suppressHydrationWarning: true,
	className: cn("h-11 w-full rounded-xl bg-surface-2 px-3.5 text-sm text-fg", "ring-1 ring-border placeholder:text-faint", "outline-none transition-[box-shadow,background-color] duration-150", "focus-visible:ring-2 focus-visible:ring-primary/70", className),
	...props
}));
Input.displayName = "Input";
//#endregion
export { Input as t };
