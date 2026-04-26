Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
page.tsx:36 GoTrueClient@sb-eioptwfwdgqnkcbeaoqp-auth-token:1 (2.104.1) 2026-04-26T16:57:30.111Z Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
forward-logs-shared.ts:95 [HMR] connected
content-script.js:22 Document already loaded, running initialization immediately
content-script.js:4 Attempting to initialize AdUnit
content-script.js:6 AdUnit initialized successfully
layout.tsx:79 A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HotReload globalError={[...]} webSocket={WebSocket} staticIndicatorState={{pathname:null, ...}}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/admin/ser..." notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <script>
                      <script>
                      <script>
                      <RootLayout>
                        <html lang="en" className="bodoni_mod...">
                          <body
                            className="min-h-screen flex flex-col overflow-y-auto"
-                           __processed_5658413f-616c-46f4-9c16-b1d6a1324592__="true"
-                           bis_register="W3sibWFzdGVyIjp0cnVlLCJleHRlbnNpb25JZCI6ImVwcGlvY2VtaG1ubGJoanBsY2drb2ZjaWll..."
                          >
                  ...
Navbar.tsx:94 Image with src "/images/logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
services:1 Access to fetch at 'https://dlnk.one/e?id=nol9RNkNdre4&type=1' from origin 'http://localhost:3000' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost' that is not equal to the supplied origin. Have the server send the header with a valid value.
content.js:2 
 POST https://dlnk.one/e?id=nol9RNkNdre4&type=1 net::ERR_FAILED 200 (OK)
content.js:2 Listener init error TypeError: Failed to fetch
    at content.js:2:91684
    at Generator.next (<anonymous>)
    at content.js:2:90359
    at new Promise (<anonymous>)
    at n (content.js:2:90104)
    at a.fetchRequest (content.js:2:91634)
    at content.js:2:91928
    at Generator.next (<anonymous>)
    at content.js:2:90359
    at new Promise (<anonymous>)
5
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
5
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
5
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
25
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
10
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
5
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
5
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
page.tsx:1420 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
4
intercept-console-error.ts:48 Encountered two children with the same key, `Beard Care`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
intercept-console-error.ts:48 Encountered two children with the same key, `Facials`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
﻿

